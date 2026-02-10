const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Função para obter o corpo bruto (raw body) da requisição
async function getRawBody(readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const sig = req.headers['stripe-signature'];
        const rawBody = await getRawBody(req);
        let event;

        try {
            // Verifica a assinatura do Stripe usando o corpo BRUTO
            event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error(`❌ Erro de Assinatura: ${err.message}`);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Evento: Pagamento concluído com sucesso
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const emailUsuario = session.customer_details.email;

            console.log(`✅ Pagamento aprovado para: ${emailUsuario}`);

            // ATUALIZA OU CRIA NO SUPABASE (UPSERT)
            // O upsert evita o erro 500 caso o usuário não esteja pré-cadastrado
            const { error } = await supabase
                .from('Usuarios_Dieta')
                .upsert(
                    { 
                        email: emailUsuario.toLowerCase().trim(), 
                        pago: true 
                    },
                    { onConflict: 'email' } // Usa o e-mail para decidir se cria ou atualiza
                );

            if (error) {
                console.error("❌ Erro ao salvar no Supabase:", error.message);
                // Retornamos 500 aqui para o Stripe saber que o banco falhou
                return res.status(500).json({ error: error.message });
            } else {
                console.log("🚀 Usuário atualizado/criado com sucesso!");
            }
        }

        res.json({ received: true });
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
};

// CONFIGURAÇÃO CRUCIAL PARA A VERCEL
export const config = {
    api: {
        bodyParser: false, // Necessário para validar a assinatura do Stripe
    },
};
