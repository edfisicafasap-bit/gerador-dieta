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
            .select('*')
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
            if (!dataReset || agora > dataReset) {
                novaContagem = 0;
                const proximoReset = new Date();
                proximoReset.setDate(proximoReset.getDate() + 7);
                novoReset = proximoReset.toISOString();
            }
            if (novaContagem >= 2) {
                return res.status(403).json({ 
                    error: 'Limite semanal atingido. Você pode gerar 2 planos por semana.' 
                });
            }
        }

        // 2. PASSO 1: GERAÇÃO INICIAL DA DIETA
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
        if (!responseGeral.ok) throw new Error('Erro na geração inicial');
        const rascunhoDieta = dataGeral.choices[0].message.content;

        // 3. PASSO 2: AUDITORIA E LIMPEZA
        const metasNoPrompt = prompt.match(/METAS:[\s\S]*?LISTA/) ? prompt.match(/METAS:[\s\S]*?LISTA/)[0] : "Bater os macros calculados.";

        const promptAuditor = `
        VOCÊ É UM AUDITOR NUTRICIONAL. 
        REVISE A DIETA ABAIXO E CORRIJA QUALQUER ERRO MATEMÁTICO NOS MACROS.
        
        Sua prioridade é a MATEMÁTICA REAL baseada nestas metas:
        ${metasNoPrompt}

        DIETA PARA REVISAR:
        ${rascunhoDieta}

        REGRAS DE OURO:
        1. Refaça as somas de cada refeição. Se houver erro, ajuste as gramagens.
        2. O total final deve ser a soma REAL das refeições apresentadas.
        3. REMOVA OBRIGATORIAMENTE qualquer Markdown (###, **, #, *). O texto deve ser plano e limpo.
        4. Comece a resposta direto com "Aqui está seu plano...".
        `;

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
        const dietaTextoFinal = dataAuditor.choices[0].message.content;

        // 4. Gerar PDF e Upload
        const nomeArquivo = `reeducacao-${emailLimpo.replace(/[@.]/g, '_')}-${Date.now()}.pdf`;
        const linkPublico = await uploadPDFSupabase(dietaTextoFinal, nomeArquivo);

        // 5. ATUALIZAÇÃO DOS CRÉDITOS E SALVAMENTO DO PROMPT (LOG DE DEBUG)
        const atualizacao = { 
            pdf_url: linkPublico, 
            ultima_geracao: agora.toISOString(),
            data_reset: novoReset,
            // SALVANDO O PROMPT NA COLUNA QUE VOCÊ CRIOU NO SQL:
            last_prompt_debug: prompt 
        };

        if (usuario.tipo_plano === 'unica') {
            atualizacao.creditos = 0;
            atualizacao.pago = false;
        } else if (usuario.tipo_plano === 'anual') {
            atualizacao.contagem_semanal = novaContagem + 1;
        }

        await supabase
            .from('Usuarios_Dieta')
            .update(atualizacao)
            .eq('email', emailLimpo);

        return res.status(200).json({ 
            dieta: dietaTextoFinal, 
            pdf_url: linkPublico 
        });

    } catch (error) {
        console.error('Erro no servidor:', error.message);
        return res.status(500).json({ error: 'Erro interno ao gerar o plano.' });
    }
}
