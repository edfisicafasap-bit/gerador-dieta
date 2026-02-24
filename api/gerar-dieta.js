import { supabase } from './supabase.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { prompt, email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email é obrigatório.' });
        }
        if (!prompt) {
            return res.status(400).json({ error: 'O prompt da dieta está vazio.' });
        }

        console.log('[1] OpenAI para:', email, '| prompt:', prompt.length, 'chars');

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

        if (!response.ok) {
            const errText = await response.text();
            console.error('[1 FALHOU] Status:', response.status, errText.substring(0, 300));
            return res.status(500).json({ error: 'Erro na IA.', detalhes: errText.substring(0, 200) });
        }

        const data = await response.json();

        if (!data.choices || data.choices.length === 0) {
            console.error('[1 FALHOU] Sem choices:', JSON.stringify(data).substring(0, 300));
            return res.status(500).json({ error: 'A IA não retornou resposta.' });
        }

        const dietaTexto = data.choices[0].message.content;
        console.log('[1 OK] Dieta:', dietaTexto.length, 'chars');

        // 2. Salvar texto da dieta no banco (campo pdf_url recebe o texto)
        const { error: dbError } = await supabase
            .from('Usuarios_Dieta')
            .upsert({ 
                email: email.toLowerCase().trim(),
                pdf_url: dietaTexto,
                ultima_geracao: new Date().toISOString() 
            }, { onConflict: 'email' });

        if (dbError) {
            console.error('[2 AVISO] DB:', dbError.message);
        } else {
            console.log('[2 OK] Banco atualizado.');
        }

        // 3. Retorno — front gera o PDF localmente via jsPDF
        return res.status(200).json({ dieta: dietaTexto });

    } catch (error) {
        console.error('[ERRO FATAL]', error.message, error.stack);
        return res.status(500).json({ error: 'Erro interno.', detalhes: error.message });
    }
}
