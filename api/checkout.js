const stripe = require('stripe')('SUA_CHAVE_SECRETA_DO_STRIPE');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { priceId } = req.body;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'pix'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'payment',
        // Altere para a URL real do seu site após o deploy
        success_url: `${req.headers.origin}/?success=true`,
        cancel_url: `${req.headers.origin}/?cancel=true`,
      });

      res.status(200).json({ id: session.id, url: session.url });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};
