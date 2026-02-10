import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Inicializa o Stripe e o Supabase usando as variáveis da Vercel
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // O Stripe envia uma solicitação POST quando o pagamento é concluído
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Coleta os dados brutos da solicitação para validar a assinatura do Stripe
    const buffer = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => resolve(Buffer.from(data)));
      req.on('error', err => reject(err));
    });

    event = stripe.webhooks.constructEvent(buffer, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Erro na assinatura do Webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Verifica se o evento é de checkout concluído
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const emailUsuario = session.customer_details.email;

    console.log('Pagamento aprovado para:', emailUsuario);

    // Salva ou atualiza o usuário no Supabase com status 'pago'
    const { error } = await supabase
      .from('Usuarios_Dieta')
      .upsert(
        { email: emailUsuario.toLowerCase().trim(), pago: true },
        { onConflict: 'email' }
      );

    if (error) {
      console.error('Erro ao salvar no Supabase:', error.message);
      return res.status(500).json({ error: 'Erro no banco de dados' });
    }
  }

  // Responde ao Stripe que o evento foi recebido com sucesso
  res.status(200).json({ received: true });
}
