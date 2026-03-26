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
        const rascunhoDieta = dataGeral.choices[0].message.content;

        // 3. PASSO 2: AUDITORIA COM FONTE DA VERDADE
        // Extraímos as metas e a lista de alimentos do prompt original para o Auditor
        const metasNoPrompt = prompt.match(/METAS:[\s\S]*?LISTA/) ? prompt.match(/METAS:[\s\S]*?LISTA/)[0] : "Bater macros.";
        const listaReferencia = prompt.split('LISTA DE ALIMENTOS:')[1] || "Use os valores do rascunho.";

        const promptAuditor = `
VOCÊ É UM SISTEMA DE CORREÇÃO MATEMÁTICA E FORMATAÇÃO DE DIETAS. 
SUA TAREFA É ENTREGAR O PLANO FINAL PRONTO, SEM EXPLICAÇÕES E SEM SUGESTÕES.

FONTE DA VERDADE (USE ESTES VALORES PARA CORRIGIR O RASCUNHO):
${listaReferencia}

METAS RÍGIDAS:
${metasNoPrompt}

DIETA PARA PROCESSAR:
${rascunhoDieta}

REGRAS OBRIGATÓRIAS:
1. NÃO EXPLIQUE O QUE VOCÊ ESTÁ FAZENDO. 
2. NÃO MOSTRE CÁLCULOS OU REVISÕES.
3. SE A DIETA ESTIVER FORA DA META, ALTERE AS GRAMAGENS AGORA NO TEXTO PARA QUE A SOMA SEJA EXATA.
4. USE OS VALORES DA "FONTE DA VERDADE" PARA GARANTIR QUE OS MACROS POR ALIMENTO ESTEJAM CERTOS.
5. REMOVA QUALQUER TEXTO QUE NÃO SEJA O CARDÁPIO.
6. FORMATAÇÃO: Sem Markdown (###, **, etc). Comece direto em [CAFÉ DA MANHÃ].

SAÍDA ESPERADA:
[NOME DA REFEIÇÃO]
- Alimento (Quantidade): [P, C, G]
...
SOMA FINAL:
Proteínas: Xg | Carboidratos: Xg | Gorduras: Xg | Calorias: X kcal
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

        // 4. GERAR PDF E UPLOAD
        const nomeArquivo = `reeducacao-${emailLimpo.replace(/[@.]/g, '_')}-${Date.now()}.pdf`;
        const linkPublico = await uploadPDFSupabase(dietaTextoFinal, nomeArquivo);

        // 5. SALVAR NO SUPABASE (DEBUG E ATUALIZAÇÃO)
        const atualizacao = { 
            pdf_url: linkPublico, 
            ultima_geracao: agora.toISOString(),
            data_reset: novoReset,
            last_prompt_debug: prompt,
            rascunho_ia_inicial: rascunhoDieta,
            prompt_auditor_enviado: promptAuditor
        };

        if (usuario.tipo_plano === 'unica') {
            atualizacao.creditos = 0;
            atualizacao.pago = false;
        } else if (usuario.tipo_plano === 'anual') {
            atualizacao.contagem_semanal = novaContagem + 1;
        }

        await supabase.from('Usuarios_Dieta').update(atualizacao).eq('email', emailLimpo);

        return res.status(200).json({ dieta: dietaTextoFinal, pdf_url: linkPublico });

    } catch (error) {
        console.error('Erro:', error.message);
        return res.status(500).json({ error: 'Erro interno.' });
    }
}
