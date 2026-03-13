import { supabase } from './supabase.js';
import { uploadPDFSupabase } from './uploadPDF.js';

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

        const emailLimpo = email.toLowerCase().trim();

        // --- NOVO: VERIFICAÇÃO DE SEGURANÇA NO SUPABASE ---
        // Verifica se o usuário tem status de pago ou créditos disponíveis
        const { data: usuario, error: userError } = await supabase
            .from('Usuarios_Dieta')
            .select('pago, creditos, tipo_plano')
            .eq('email', emailLimpo)
            .maybeSingle();

        if (userError) throw userError;

        // Se o usuário não for encontrado ou não tiver pago, bloqueia a geração
        if (!usuario || (!usuario.pago && usuario.creditos <= 0)) {
            return res.status(403).json({ 
                error: 'Acesso negado. Pagamento não verificado ou sem créditos disponíveis.' 
            });
        }

        // 1. Chamada para a OpenAI (Mantendo sua lógica original)
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
            console.error('Erro na resposta da OpenAI:', data);
            return res.status(500).json({ error: 'Erro ao processar inteligência artificial.' });
        }

        const dietaTexto = data.choices[0].message.content;

        // 2. Gerar PDF e Upload (Utilizando sua função importada)
        const nomeArquivo = `dieta-${emailLimpo.replace(/[@.]/g, '_')}-${Date.now()}.pdf`;
        const linkPublico = await uploadPDFSupabase(dietaTexto, nomeArquivo);

        // 3. Atualizar o banco de dados
        // Se for plano único, consumimos o crédito aqui para evitar reuso indevido
        const atualizacao = { 
            pdf_url: linkPublico, 
            ultima_geracao: new Date().toISOString() 
        };

        if (usuario.tipo_plano === 'unica') {
            atualizacao.creditos = 0;
        }

        const { error: dbError } = await supabase
            .from('Usuarios_Dieta')
            .update(atualizacao)
            .eq('email', emailLimpo);

        if (dbError) {
            console.error('Erro ao atualizar banco de dados:', dbError);
        }

        // 4. Retorno final para o index.html
        return res.status(200).json({ 
            dieta: dietaTexto, 
            pdf_url: linkPublico 
        });

    } catch (error) {
        console.error('Erro no fluxo principal (Back-end):', error.message);
        return res.status(500).json({ 
            error: 'Erro interno no servidor ao gerar sua dieta.' 
        });
    }
}
