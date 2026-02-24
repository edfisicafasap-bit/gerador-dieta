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

        // Verifica se a OpenAI retornou erro
        if (!response.ok || !data.choices || data.choices.length === 0) {
            console.error('[ETAPA 1 FALHOU] Resposta da OpenAI:', JSON.stringify(data).substring(0, 500));
            return res.status(500).json({ error: 'A IA não conseguiu gerar o texto. Verifique sua chave ou créditos.', detalhes: data?.error?.message || 'Sem detalhes' });
        }

        const dietaTexto = data.choices[0].message.content;
        console.log('[ETAPA 1 OK] Dieta gerada, tamanho:', dietaTexto.length);

        // 2. Gerar nome único e fazer upload do PDF
        console.log('[ETAPA 2] Gerando e enviando PDF...');
        const nomeArquivo = `dieta-${email.replace(/[@.]/g, '_')}-${Date.now()}.pdf`;
        
        let linkAssinado;
        try {
            linkAssinado = await uploadPDFSupabase(dietaTexto, nomeArquivo);
            console.log('[ETAPA 2 OK] PDF URL:', linkAssinado);
        } catch (uploadErr) {
            console.error('[ETAPA 2 FALHOU] Erro no upload:', uploadErr.message);
            // Continuar sem PDF - retornar dieta texto mesmo assim
            linkAssinado = null;
        }

        // 3. Salvar pdf_url na tabela Usuarios_Dieta
        console.log('[ETAPA 3] Salvando no banco...');
        const { error: dbError } = await supabase
            .from('Usuarios_Dieta')
            .upsert({ 
                email: email.toLowerCase().trim(),
                pdf_url: linkAssinado, 
                ultima_geracao: new Date().toISOString() 
            }, { onConflict: 'email' });

        if (dbError) {
            console.error('[ETAPA 3 FALHOU] Erro no banco:', dbError.message);
            // Não travar - a dieta já foi gerada
        } else {
            console.log('[ETAPA 3 OK] Banco atualizado.');
        }

        // 4. Retorno final para o index.html
        console.log('[CONCLUÍDO] Retornando dieta para o front.');
        return res.status(200).json({ 
            dieta: dietaTexto, 
            pdf_url: linkAssinado 
        });

    } catch (error) {
        console.error('[ERRO FATAL]', error.message, error.stack);
        return res.status(500).json({ 
            error: 'Erro interno ao processar sua dieta.',
            detalhes: error.message 
        });
    }
}
