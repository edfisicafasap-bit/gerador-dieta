import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const { priceId, email, tipoPlano } = req.body;

        if (!priceId || !email) {
            return res.status(400).json({ error: 'Dados insuficientes.' });
        }

        // Como agora ambos os planos são "Avulsos" no Stripe,
        // usamos sempre o modo 'payment' para permitir parcelamento e PIX.
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'pix'], 
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: 'payment', 
            customer_email: email.toLowerCase().trim(),
            // Permite que o Stripe Brasil trate o parcelamento
            payment_intent_data: {
                metadata: { 
                    email: email.toLowerCase().trim(), 
                    tipo: tipoPlano 
                },
            },
            success_url: `${req.headers.origin}/?pago=true`,
            cancel_url: `${req.headers.origin}/`,
            metadata: {
                email: email.toLowerCase().trim(),
                tipo_plano: tipoPlano
            }
        });

        return res.status(200).json({ url: session.url });
    } catch (err) {
        console.error("Erro no Stripe:", err.message);
        return res.status(500).json({ error: err.message });
    }
}
