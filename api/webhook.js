import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const buffer = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => resolve(Buffer.from(data)));
      req.on('error', err => reject(err));
    });

    event = stripe.webhooks.constructEvent(
      buffer,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

  } catch (err) {
    console.error('Erro na assinatura do Webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 🔥 Quando pagamento é concluído
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const emailUsuario = session.customer_details?.email;

    // 🔎 Buscar os itens da sessão para descobrir qual price foi pago
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

    const priceId = lineItems.data[0].price.id;

    let tipoPlano;

    // ⚠️ CONFIRA SE ESTES SÃO SEUS PRICE IDs REAIS
    if (priceId === 'price_1Sz1w7GEaACih56ZWyTiPBAu') {
      tipoPlano = 'unica';
    } else if (priceId === 'price_1SzPP7GEaACih56ZkwV5mxN2') {
      tipoPlano = 'anual';
    }

    console.log('Pagamento aprovado para:', emailUsuario);
    console.log('Price ID:', priceId);
    console.log('Tipo de plano identificado:', tipoPlano);

    if (!tipoPlano) {
      console.error('Tipo de plano não identificado!');
      return res.status(400).json({ error: 'Plano não reconhecido' });
    }

    const { error } = await supabase
      .from('Usuarios_Dieta')
      .upsert(
        { 
          email: emailUsuario.toLowerCase().trim(),
          pago: true,
          tipo_plano: tipoPlano,
          creditos: tipoPlano === 'unica' ? 1 : 9999
        },
        { onConflict: 'email' }
      );

    if (error) {
      console.error('Erro ao salvar no Supabase:', error.message);
      return res.status(500).json({ error: 'Erro no banco de dados' });
    }
  }

  return res.status(200).json({ received: true });
}
