import { createClient } from '@supabase/supabase-js';

// Inicialização utilizando a SERVICE_ROLE_KEY que está configurada na sua Vercel
const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { prompt, email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email é obrigatório para salvar a dieta.' });
        }

        // 1. Chamada para a OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });

        const data = await response.json();
        
        if (!data.choices || !data.choices[0]) {
            console.error('Erro detalhado da OpenAI:', data);
            throw new Error('Falha na resposta da OpenAI');
        }

        const dietaTexto = data.choices[0].message.content;

        // 2. Salvar a dieta no banco de dados (Persistência)
        // Usamos a Service Role para garantir a escrita sem bloqueios de RLS
        const { error: dbError } = await supabase
            .from('Usuarios_Dieta')
            .update({ 
                pdf_url: dietaTexto, 
                ultima_geracao: new Date().toISOString() 
            })
            .eq('email', email.toLowerCase().trim());

        if (dbError) {
            console.error('Erro ao salvar no Supabase:', dbError);
            throw dbError;
        }

        // 3. Retorna o texto para o Front-end
        return res.status(200).json({ dieta: dietaTexto });

    } catch (error) {
        console.error('Erro na API:', error);
        return res.status(500).json({ error: 'Erro ao gerar ou salvar a dieta.' });
    }
}
