import { supabase } from './supabase.js';
import { uploadPDFSupabase } from './uploadPDF.js';

export default async function handler(req, res) {
    // Garante que apenas requisições POST sejam aceitas
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { prompt, email } = req.body;

        // Validação básica de entrada
        if (!email) {
            return res.status(400).json({ error: 'Email é obrigatório.' });
        }
        if (!prompt) {
            return res.status(400).json({ error: 'O prompt da dieta está vazio.' });
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

        // Verifica se a OpenAI retornou erro
        if (!response.ok || !data.choices || data.choices.length === 0) {
            console.error('Erro na resposta da OpenAI:', data);
            return res.status(500).json({ error: 'A IA não conseguiu gerar o texto. Verifique sua chave ou créditos.' });
        }

        const dietaTexto = data.choices[0].message.content;

        // 2. Gerar nome único e fazer upload (Disfarçado de .pdf para aceitação do Storage)
        const nomeArquivo = `dieta-${email.replace(/[@.]/g, '_')}-${Date.now()}.pdf`;
        
        // Esta função agora retorna o Link Assinado (Signed URL)
        const linkAssinado = await uploadPDFSupabase(dietaTexto, nomeArquivo);

        // 3. Atualizar a tabela Usuarios_Dieta no Banco de Dados
        const { error: dbError } = await supabase
            .from('Usuarios_Dieta')
            .update({ 
                pdf_url: linkAssinado, 
                ultima_geracao: new Date().toISOString() 
            })
            .eq('email', email.toLowerCase().trim());

        if (dbError) {
            console.error('Erro ao atualizar banco de dados:', dbError);
            throw dbError;
        }

        // 4. Retorno final para o seu index.html
        return res.status(200).json({ 
            dieta: dietaTexto, 
            pdf_url: linkAssinado 
        });

    } catch (error) {
        console.error('Erro no fluxo principal (Back-end):', error.message);
        return res.status(500).json({ 
            error: 'Erro interno ao processar sua dieta.',
            detalhes: error.message 
        });
    }
}
