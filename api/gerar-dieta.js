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
            return res.status(400).json({ error: 'O prompt da Reeducação Alimentar está vazio.' });
        }

        const emailLimpo = email.toLowerCase().trim();

        // 1. VERIFICAÇÃO DE SEGURANÇA NO SUPABASE
        // Verifica se o usuário já passou pelo pagamento (Webhook já deve ter atuado)
        const { data: usuario, error: userError } = await supabase
            .from('Usuarios_Dieta')
            .select('pago, creditos, tipo_plano')
            .eq('email', emailLimpo)
            .maybeSingle();

        if (userError) throw userError;

        // Se não encontrar o registro ou se o status de 'pago' for falso e não houver créditos
        if (!usuario || (!usuario.pago && (usuario.creditos === null || usuario.creditos <= 0))) {
            return res.status(403).json({ 
                error: 'Acesso negado. Por favor, conclua o pagamento para gerar sua Reeducação Alimentar.' 
            });
        }

        // 2. Chamada para a OpenAI (Só ocorre se o pagamento for confirmado acima)
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
            return res.status(500).json({ error: 'Erro ao processar inteligência artificial.' });
        }

        const dietaTexto = data.choices[0].message.content;

        // 3. Gerar PDF e Upload para o Bucket 'dietas-pdf'
        const nomeArquivo = `reeducacao-${emailLimpo.replace(/[@.]/g, '_')}-${Date.now()}.pdf`;
        const linkPublico = await uploadPDFSupabase(dietaTexto, nomeArquivo);

        // 4. Atualizar o banco de dados e consumir crédito se for plano único
        const atualizacao = { 
            pdf_url: linkPublico, 
            ultima_geracao: new Date().toISOString() 
        };

        // Se for plano único, zeramos os créditos para evitar gerações infinitas
        if (usuario.tipo_plano === 'unica') {
            atualizacao.creditos = 0;
            atualizacao.pago = false; // Opcional: marca como usado
        }

        await supabase
            .from('Usuarios_Dieta')
            .update(atualizacao)
            .eq('email', emailLimpo);

        // 5. Retorno para o front-end
        return res.status(200).json({ 
            dieta: dietaTexto, 
            pdf_url: linkPublico 
        });

    } catch (error) {
        console.error('Erro no servidor:', error.message);
        return res.status(500).json({ 
            error: 'Erro interno ao gerar o plano de Reeducação Alimentar.' 
        });
    }
}
