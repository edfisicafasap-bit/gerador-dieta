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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const emailUsuario = session.customer_details?.email?.toLowerCase().trim();

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0].price.id;

    let tipoPlano;
    // IDs de preço do seu Stripe
    if (priceId === 'price_1Sz1w7GEaACih56ZWyTiPBAu') {
      tipoPlano = 'unica';
    } else if (priceId === 'price_1SzPP7GEaACih56ZkwV5mxN2') {
      tipoPlano = 'anual';
    }

    if (!tipoPlano) {
      console.error('Tipo de plano não identificado para o priceId:', priceId);
      return res.status(400).json({ error: 'Plano não reconhecido' });
    }

    console.log('Pagamento aprovado para:', emailUsuario);

    // 1️⃣ Atualiza o status de pago no banco (usando upsert para garantir que o registro exista)
    const { error } = await supabase
      .from('Usuarios_Dieta')
      .upsert(
        { 
          email: emailUsuario,
          pago: true,
          tipo_plano: tipoPlano,
          creditos: tipoPlano === 'unica' ? 1 : 9999
        },
        { onConflict: 'email' }
      );

    if (error) {
      console.error('Erro ao atualizar status de pago no Supabase:', error.message);
    }

    // 2️⃣ DISPARA A GERAÇÃO DA DIETA
    try {
      console.log('Iniciando geração automática para:', emailUsuario);
      
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gerador-dieta-hl6k.vercel.app';
      
      // Chamada para a API que corrigimos no passo anterior
      const response = await fetch(`${baseUrl}/api/gerar-dieta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: emailUsuario // O gerar-dieta.js usará isso para buscar peso/objetivo no banco
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Falha na resposta da API gerar-dieta:', errorText);
      } else {
        console.log('Dieta gerada e salva no banco com sucesso via Webhook!');
      }

    } catch (fetchError) {
      console.error('Erro de conexão ao chamar api/gerar-dieta:', fetchError.message);
    }
  }

  return res.status(200).json({ received: true });
}
