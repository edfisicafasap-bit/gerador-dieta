import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { buffer } from 'micro'; // Você vai precisar adicionar 'micro' ao package.json ou usar a lógica nativa abaixo

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// IMPORTANTE: Configuração para a Vercel não mexer no corpo da requisição
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const sig = req.headers['stripe-signature'];
  let event;
  let rawBody;

  try {
    // Forma robusta de pegar o buffer na Vercel
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    rawBody = Buffer.concat(chunks);

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

  } catch (err) {
    console.error('Erro na assinatura do Webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 🔥 Lógica de processamento do evento
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const emailUsuario = session.customer_details?.email;

    // Buscar itens para confirmar o Price ID
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0].price.id;

    let tipoPlano;
    // IDs de TESTE (Certifique-se que são os mesmos do seu index.html)
    if (priceId === 'price_1Sz1w7GEaACih56ZWyTiPBAu') {
      tipoPlano = 'unica';
    } else if (priceId === 'price_1TAhibGEaACih56Z4TeYkNwK') {
      tipoPlano = 'anual';
    }

    if (tipoPlano && emailUsuario) {
      await supabase
        .from('Usuarios_Dieta')
        .upsert({ 
          email: emailUsuario.toLowerCase().trim(),
          pago: true,
          tipo_plano: tipoPlano,
          creditos: tipoPlano === 'unica' ? 1 : 999,
          data_reset: new Date().toISOString()
        });
      console.log(`Sucesso: Acesso liberado para ${emailUsuario}`);
    }
  }

  res.status(200).json({ received: true });
}
