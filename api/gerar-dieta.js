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

        // 1. VERIFICAÇÃO DE SEGURANÇA E USUÁRIO
        const { data: usuario, error: userError } = await supabase
            .from('Usuarios_Dieta')
            .select('*')
            .eq('email', emailLimpo)
            .maybeSingle();

        if (userError) throw userError;

        if (!usuario || (!usuario.pago && (usuario.creditos === null || usuario.creditos <= 0))) {
            return res.status(403).json({ error: 'Acesso negado. Conclua o pagamento.' });
        }

        // --- LÓGICA DO PLANO ANUAL ---
        let novaContagem = usuario.contagem_semanal || 0;
        let novoReset = usuario.data_reset;

        if (usuario.tipo_plano === 'anual') {
            const dataReset = usuario.data_reset ? new Date(usuario.data_reset) : null;
            if (!dataReset || agora > dataReset) {
                novaContagem = 0;
                const proximoReset = new Date();
                proximoReset.setDate(proximoReset.getDate() + 7);
                novoReset = proximoReset.toISOString();
            }
            if (novaContagem >= 2) {
                return res.status(403).json({ error: 'Limite semanal atingido.' });
            }
        }

        // 2. PASSO 1: GERAÇÃO INICIAL
        const responseGeral = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3 
            })
        });

        const dataGeral = await responseGeral.json();
        const dietaGeradaPelaIA = dataGeral.choices?.[0]?.message?.content || "Erro na geração inicial";

        // 3. PASSO 2: ENVIO DA DIETA GERADA + INSTRUÇÃO DE AJUSTE (AUDITOR)
        const promptAuditor = `${dietaGeradaPelaIA}\n\nINSTRUÇÃO OBRIGATÓRIA:\n"faça os ajustes mencionados e me devolva com a mesma formatação, não explique e nem de detalhes do que foi feito, apenas ajustes e me devolva, nao quero que escreva nada do que foi ajustado, quero a dieta limpa e formatada. no topo quero que tire as calorias, deixando mencionado apenas o objetivo da dieta e a quantidade de refeições"`;

        const responseAuditor = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: promptAuditor }],
                temperature: 0 
            })
        });

        const dataAuditor = await responseAuditor.json();
        const dietaTextoFinal = dataAuditor.choices?.[0]?.message?.content || "Erro na conferência";

        // 4. GERAR PDF E UPLOAD
        const nomeArquivo = `reeducacao-${emailLimpo.replace(/[@.]/g, '_')}-${Date.now()}.pdf`;
        const linkPublico = await uploadPDFSupabase(dietaTextoFinal, nomeArquivo);

        // 5. SALVAR NO SUPABASE (VERSÃO CORRIGIDA)
        const atualizacao = { 
            pdf_url: linkPublico, 
            ultima_geracao: agora.toISOString(),
            data_reset: novoReset || usuario.data_reset,
            last_prompt_debug: String(prompt),
            rascunho_ia_inicial: String(dietaGeradaPelaIA), 
            prompt_auditor_enviado: String(promptAuditor)
        };

        if (usuario.tipo_plano === 'unica') {
            atualizacao.creditos = 0;
            atualizacao.pago = false;
        } else if (usuario.tipo_plano === 'anual') {
            atualizacao.contagem_semanal = (novaContagem || 0) + 1;
        }

        // Executa a atualização
        const { error: updateError } = await supabase
            .from('Usuarios_Dieta')
            .update(atualizacao)
            .eq('email', emailLimpo);

        if (updateError) {
            console.error('ERRO SUPABASE:', updateError.message);
        } else {
            console.log('✅ Banco atualizado com sucesso para:', emailLimpo);
        }

        return res.status(200).json({ dieta: dietaTextoFinal, pdf_url: linkPublico });

    } catch (error) {
        console.error('Erro Geral:', error.message);
        return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
}
