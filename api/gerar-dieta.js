import { supabase } from './supabase.js';
import { uploadPDFSupabase } from './uploadPDF.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { prompt, email } = req.body;

        if (!email) return res.status(400).json({ error: 'Email é obrigatório.' });
        if (!prompt) return res.status(400).json({ error: 'O prompt está vazio.' });

        const emailLimpo = email.toLowerCase().trim();
        const agora = new Date();

        // 1. VERIFICAÇÃO DE SEGURANÇA E REGRAS DE NEGÓCIO
        const { data: usuario, error: userError } = await supabase
            .from('Usuarios_Dieta')
            .select('*') // Selecionamos tudo para ter contagem_semanal e data_reset
            .eq('email', emailLimpo)
            .maybeSingle();

        if (userError) throw userError;

        if (!usuario || (!usuario.pago && (usuario.creditos === null || usuario.creditos <= 0))) {
            return res.status(403).json({ error: 'Acesso negado. Conclua o pagamento.' });
        }

        // --- LÓGICA DO PLANO ANUAL (2 POR SEMANA) ---
        let novaContagem = usuario.contagem_semanal || 0;
        let novoReset = usuario.data_reset;

        if (usuario.tipo_plano === 'anual') {
            const dataReset = usuario.data_reset ? new Date(usuario.data_reset) : null;

            // Se não houver data_reset ou se a data já passou, resetamos a semana
            if (!dataReset || agora > dataReset) {
                novaContagem = 0;
                const proximoReset = new Date();
                proximoReset.setDate(proximoReset.getDate() + 7);
                novoReset = proximoReset.toISOString();
            }

            // Verifica se já atingiu o limite de 2 na semana atual
            if (novaContagem >= 2) {
                return res.status(403).json({ 
                    error: 'Limite semanal atingido. Você pode gerar 2 planos por semana.' 
                });
            }
        }
        // --------------------------------------------

        // 2. Chamada para a OpenAI
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
        if (!response.ok || !data.choices) throw new Error('Erro na IA');

        const dietaTexto = data.choices[0].message.content;

        // 3. Gerar PDF e Upload
        const nomeArquivo = `reeducacao-${emailLimpo.replace(/[@.]/g, '_')}-${Date.now()}.pdf`;
        const linkPublico = await uploadPDFSupabase(dietaTexto, nomeArquivo);

        // 4. ATUALIZAÇÃO DOS CRÉDITOS E CONTROLE SEMANAL
        const atualizacao = { 
            pdf_url: linkPublico, 
            ultima_geracao: agora.toISOString(),
            data_reset: novoReset
        };

        if (usuario.tipo_plano === 'unica') {
            atualizacao.creditos = 0;
            atualizacao.pago = false;
        } else if (usuario.tipo_plano === 'anual') {
            atualizacao.contagem_semanal = novaContagem + 1; // Incrementa o uso
        }

        await supabase
            .from('Usuarios_Dieta')
            .update(atualizacao)
            .eq('email', emailLimpo);

        return res.status(200).json({ 
            dieta: dietaTexto, 
            pdf_url: linkPublico 
        });

    } catch (error) {
        console.error('Erro no servidor:', error.message);
        return res.status(500).json({ error: 'Erro interno ao gerar o plano.' });
    }
}
