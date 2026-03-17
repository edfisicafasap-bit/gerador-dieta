import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 1. CRUCIAL: Desativa o Body Parser automático da Vercel
export const config = {
  api: {
    bodyParser: false,
  },
};

// Função auxiliar para converter a requisição em texto bruto (Buffer)
async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // 2. Lemos o corpo EXATAMENTE como ele chegou, sem formatação
    const rawBody = await buffer(req);

    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`❌ Erro na assinatura: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Se passou da linha acima, a assinatura é VÁLIDA!
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const emailUsuario = session.customer_details?.email?.toLowerCase().trim();

    // Buscar itens para confirmar o Price ID (Plano Único ou Anual)
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0].price.id;

    let tipoPlano = priceId === 'price_1Sz1w7GEaACih56ZWyTiPBAu' ? 'unica' : 'anual';

    // Salva ou atualiza o usuário no seu banco de Reeducação Alimentar
    await supabase.from('Usuarios_Dieta').upsert({ 
      email: emailUsuario,
      pago: true,
      tipo_plano: tipoPlano,
      creditos: tipoPlano === 'unica' ? 1 : 999,
      data_reset: new Date().toISOString()
    });

    console.log(`✅ Acesso liberado para: ${emailUsuario}`);
  }

  res.json({ received: true });
}
