import { supabase } from './supabase.js';
import { uploadPDFSupabase } from './uploadPDF.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    try {
        const { prompt, email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email é obrigatório.' });

        // 1. Chamada para a OpenAI (Seu "Cérebro")
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
        const dietaTexto = data.choices[0].message.content;

        // 2. Gerar nome único e fazer upload usando sua função original adaptada
        const nomeArquivo = `dieta-${email.replace(/[@.]/g, '_')}-${Date.now()}.pdf`;
        const linkAssinado = await uploadPDFSupabase(dietaTexto, nomeArquivo);

        // 3. Atualizar a tabela Usuarios_Dieta com o link assinado
        const { error: dbError } = await supabase
            .from('Usuarios_Dieta')
            .update({ 
                pdf_url: linkAssinado, 
                ultima_geracao: new Date().toISOString() 
            })
            .eq('email', email.toLowerCase().trim());

        if (dbError) throw dbError;

        // 4. Retorna para o index.html
        return res.status(200).json({ 
            dieta: dietaTexto, 
            pdf_url: linkAssinado 
        });

    } catch (error) {
        console.error('Erro no fluxo principal:', error);
        return res.status(500).json({ error: 'Erro ao processar sua dieta.' });
    }
}
