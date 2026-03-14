import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { priceId, email, tipoPlano } = req.body;

    // Validação básica
    if (!priceId || !email) {
      return res.status(400).json({ error: 'Price ID e Email são obrigatórios.' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'pix'], // Adicionado PIX para facilitar vendas no Brasil
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      // Se for anual, verifique se no Stripe ele é recorrente. 
      // Se for cobrança única de 29,90, mantenha 'payment'.
      // Se for assinatura que cobra todo ano, mude para 'subscription'.
      mode: 'payment', 
      customer_email: email, // O Stripe já preenche o e-mail no checkout para o cliente
      success_url: `${req.headers.origin}/?pago=true`,
      cancel_url: `${req.headers.origin}/`,
      metadata: {
        email: email.toLowerCase().trim(),
        tipo_plano: tipoPlano
      }
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Erro no Stripe Checkout:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
