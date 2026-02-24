import { supabase } from './supabase.js';
import { uploadPDFSupabase } from './uploadPDF.js';

// Estender timeout da Vercel (padrão é 10s, OpenAI pode demorar)
export const config = { maxDuration: 60 };

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

        console.log('[ETAPA 1] Chamando OpenAI para:', email);

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

        if (!response.ok || !data.choices || data.choices.length === 0) {
            console.error('[ETAPA 1 FALHOU]', JSON.stringify(data).substring(0, 500));
            return res.status(500).json({ 
                error: 'A IA não conseguiu gerar o texto.', 
                detalhes: data?.error?.message || 'Sem detalhes' 
            });
        }

        const dietaTexto = data.choices[0].message.content;
        console.log('[ETAPA 1 OK] Dieta gerada, tamanho:', dietaTexto.length);

        // 2. Gerar PDF e fazer upload para o Supabase Storage
        console.log('[ETAPA 2] Gerando PDF e fazendo upload...');
        const nomeArquivo = `dieta-${email.replace(/[@.]/g, '_')}-${Date.now()}.pdf`;
        
        let pdfUrl = null;
        try {
            pdfUrl = await uploadPDFSupabase(dietaTexto, nomeArquivo);
            console.log('[ETAPA 2 OK] PDF URL:', pdfUrl);
        } catch (uploadErr) {
            console.error('[ETAPA 2 FALHOU] Erro no upload:', uploadErr.message);
            // Continuar sem PDF - o front gera localmente como fallback
        }

        // 3. Salvar link do PDF no banco
        console.log('[ETAPA 3] Salvando no banco...');
        const { error: dbError } = await supabase
            .from('Usuarios_Dieta')
            .upsert({ 
                email: email.toLowerCase().trim(),
                pdf_url: pdfUrl,
                ultima_geracao: new Date().toISOString() 
            }, { onConflict: 'email' });

        if (dbError) {
            console.error('[ETAPA 3 AVISO] Erro no banco:', dbError.message);
        } else {
            console.log('[ETAPA 3 OK] Banco atualizado.');
        }

        // 4. Retorno para o front-end
        console.log('[CONCLUÍDO] Retornando dieta.');
        return res.status(200).json({ dieta: dietaTexto, pdf_url: pdfUrl });

    } catch (error) {
        console.error('[ERRO FATAL]', error.message, error.stack);
        return res.status(500).json({ 
            error: 'Erro interno ao processar sua dieta.',
            detalhes: error.message 
        });
    }
}
