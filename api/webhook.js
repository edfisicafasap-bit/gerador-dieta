import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Configuração do Stripe e Supabase
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 1. OBRIGATÓRIO: Desativa o Body Parser da Vercel para não corromper a assinatura
export const config = {
  api: {
    bodyParser: false,
  },
};

// Função para ler o corpo bruto (Raw Body) de forma robusta
async function getRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // 2. Lemos o corpo EXATAMENTE como ele chegou do Stripe
    const rawBody = await getRawBody(req);
    
    // 3. Verifica a assinatura original do Stripe
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`❌ Erro de Assinatura: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 4. Lógica após confirmação de pagamento
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Pegamos o e-mail do cliente (priorizando o e-mail de faturamento)
    const emailUsuario = (session.customer_details?.email || session.customer_email)?.toLowerCase().trim();

    try {
      // Buscamos o item comprado para definir o plano
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const priceId = lineItems.data[0]?.price?.id;

      // Seus IDs de preço do Stripe
      const ID_PLANO_UNICO = 'price_1Sz1w7GEaACih56ZWyTiPBAu';
      const tipoPlano = priceId === ID_PLANO_UNICO ? 'unica' : 'anual';

      // 5. Upsert no Supabase (Cria se não existe, atualiza se existe)
      const { error: dbError } = await supabase
        .from('Usuarios_Dieta')
        .upsert({ 
          email: emailUsuario,
          pago: true,
          tipo_plano: tipoPlano,
          creditos: tipoPlano === 'unica' ? 1 : 999,
          data_reset: new Date().toISOString()
        }, { onConflict: 'email' });

      if (dbError) throw dbError;

      console.log(`✅ Sucesso: Plano ${tipoPlano} liberado para ${emailUsuario}`);
    } catch (dbErr) {
      console.error(`❌ Erro ao salvar no Banco: ${dbErr.message}`);
      return res.status(500).json({ error: 'Erro ao atualizar banco de dados' });
    }
  }

  // Retorna 200 para o Stripe parar de tentar reenviar
  res.status(200).json({ received: true });
}
