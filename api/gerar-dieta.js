import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { supabase } from './supabase.js'; 

const delay = ms => new Promise(res => setTimeout(res, ms));

async function gerarPDF(conteudo, usuarioId) {
  const nomeLimpo = usuarioId.replace(/[^a-zA-Z0-9]/g, '_');
  const caminhoArquivo = path.join('/tmp', `dieta-${nomeLimpo}.pdf`);
  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(caminhoArquivo);
  return new Promise((resolve, reject) => {
    doc.pipe(stream);
    doc.font('Helvetica-Bold').fontSize(22).text('SEU PLANO ALIMENTAR', { align: 'center' });
    doc.moveDown();
    doc.font('Helvetica').fontSize(12).text(conteudo, { align: 'justify', lineGap: 5 });
    doc.end();
    stream.on('finish', () => resolve(caminhoArquivo));
    stream.on('error', (err) => reject(err));
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const body = req.body;
    const email = (body.usuarioId || body.email || "").toLowerCase().trim();
    if (!email) return res.status(400).json({ error: 'E-mail obrigatório' });

    // Pequena pausa para o banco processar o registro do Passo 1
    await delay(1500);

    // BUSCA NO SUPABASE
    const { data: userDb, error: dbError } = await supabase
        .from('Usuarios_Dieta')
        .select('*')
        .eq('email', email)
        .single();

    // LÓGICA DE SEGURANÇA: Prioriza Banco, mas aceita Body (Plano B)
    // Isso impede o erro 500 se o registro for muito novo
    const peso = userDb?.peso || body.peso;
    const objetivo = userDb?.objetivo || body.objetivo;
    const calorias = userDb?.meta_calorias || body.calorias;
    const nome = userDb?.nome || body.nome || "Cliente";
    const refeicoes = userDb?.refeicoes || body.refeicoes || 4;

    // Se ainda assim faltar dado, enviamos erro 400 (limpo) em vez de 500
    if (!peso || !objetivo || !calorias) {
        return res.status(400).json({ 
            error: "Dados técnicos não encontrados. Por favor, preencha o formulário novamente." 
        });
    }

    // LOG DE DEBUG NO BANCO
    await supabase.from('Usuarios_Dieta').update({ 
        debug_log: `Gerando: Peso=${peso}, Obj=${objetivo}, Kcal=${calorias}` 
    }).eq('email', email);

    // Aqui você pode colar o seu PROMPT GIGANTE original. 
    // Usei as variáveis corrigidas (${peso}, ${objetivo}, etc.)
     const promptFinal = `Atue como um Nutricionista Prático. Comece a resposta exatamente com este parágrafo: "Aqui está um plano de refeições de ${d.calorias} kcal para ${d.objetivo}, dividido em ${d.refeicoes} refeições, utilizando os alimentos que você selecionou.". Seu objetivo é converter listas de alimentos e macros em um cardápio culinário real, focado em "comida de verdade" e preparações reconhecíveis. Gere um plano de ${d.calorias}kcal para ${d.objetivo}, dividido em ${d.refeicoes} refeições. Use estes alimentos: ${d.alimentos.join(', ')}. Preparos selecionados pelo usuário: ${d.preparos.join(', ')}.

DIRETRIZES SUPREMAS

DETERMINAÇÃO DE REFEIÇÕES:
Voce deve gerar EXATAMENTE ${d.refeicoes} refeicoes.
- Se ${d.refeicoes} for 4: Use (1. Cafe da Manha, 2. Almoco, 3. Cafe da Tarde, 4. Jantar).
- Se ${d.refeicoes} for 5: Use (1. Cafe da Manha, 2. Almoco, 3. Cafe da Tarde, 4. Jantar, 5. Ceia).
- Se ${d.refeicoes} for 6: Use (1. Desjejum, 2. Cafe da Manha, 3. Almoco, 4. Cafe da Tarde, 5. Jantar, 6. Ceia).

DICA: Nunca pule o Cafe da Tarde entre o Almoco e o Jantar.


REGRAS POR HORÁRIO
CAFÉ DA MANHÃ: Máximo 3 itens. Transformar em: Bowl, Shake, Vitamina, Sanduíche ou Omelete. 
LANCHES, DESJEJUM E CAFÉ DA TARDE: Foco em portabilidade e simplicidade.
ALMOÇO/JANTAR: Estrutura [Base de Carboidrato] + [Proteína] + [Legumes/Salada].
Jantar pode ser mais leve, mas deve manter a estrutura de refeição completa.
CEIA: REFEIÇÕES SUPER LEVES, COMO UMA FRUTA, OU FRUTA + WHEY, OU IOGURTE...
REGRA IMPORTANTE: INCLUIR AO MENOS UMA FONTE DE PROTEINA EM TODAS AS REFEIÇÕES.

CÁLCULO DA DIETA:   A PROTEINA DEVE TER O ENTRE 1.8 A 2.2g POR kg CORPORAL DA PESSOA, a Gordura 1g por kg corporal e o Carboidrato deve complementar o Restante das calorias, seja o mais rigoroso possivel nesse critério para chegar o mais proximo da meta possivel!  Use bases científicas (TACO/TBCA), NÃO CRIE TABELAS DE MACRO NUTRIENTES FICTICIOS, UTILIZE SOMENTE MACROS REAIS DOS ALIMENTOS!.

Alimentos permitidos: Utilize receitas e pratos somente que contenham os alimentos previamente selecionados, não crie receitas que não contenham alimentos mencionados.
Proibido Alimentos Soltos: Nunca liste ingredientes isolados (ex: "30g de aveia"). Transforme-os em preparações (ex: "Mingau de aveia").
Base Obrigatória: No Almoço e Jantar, se houver Arroz e/ou Feijão nos ingredientes, eles devem obrigatoriamente compor a base da refeição.
Coerência Cultural: As refeições devem respeitar os hábitos brasileiros (Café, Almoço, Lanche, Jantar).

PLANEJAMENTO ALIMENTAR ESTRUTURADO

BLOCO 1: OPÇÕES A (PADRÃO)
Nesta seção, gere as ${d.refeicoes} refeições seguindo os nomes definidos nas "DIRETRIZES SUPREMAS". Priorize arroz e feijão no almoço e jantar.
Para cada uma das ${d.refeicoes} refeições, liste:
- Ingredientes (com quantidades)

RESUMO DE MACROS (OPÇÕES A)
Proteinas Totais: [Soma Real]g | Carboidratos Totais: [Soma Real]g | Gorduras Totais: [Soma Real]g

BLOCO 2: OPÇÕES B (VARIAÇÃO)
Nesta seção, gere as mesmas ${d.refeicoes} refeições com macros equivalentes ao Bloco 1. No almoço e jantar, é proibido o uso de arroz e feijão.
Para cada uma das ${d.refeicoes} refeições, liste:
- Ingredientes (com quantidades)
RESUMO DE MACROS (OPÇÕES B)
Proteinas Totais: [Soma Real]g | Carboidratos Totais: [Soma Real]g | Gorduras Totais: [Soma Real]g

PROTOCOLO DE VALIDAÇÃO
Antes de exibir, valide: "A Opção B de almoço/jantar está sem arroz e feijão? Os macros estão equilibrados? O prato parece algo que se come no Brasil? só prossiga caso seja refeições reais, caso contrário, refaça!"
IMPORTANTE: Valide internamente, mas não escreva esta validação ou protocolo no resultado final.

ITENS COMPLEMENTARES:
1. HIDRATAÇÃO: Informe a recomendação de ${(parseFloat(d.peso) * 0.035).toFixed(1)}L de água por dia.
2. DATA: ${new Date().toLocaleString()}.

ACRESCENTE UM RODAPÉ ESCRITO: "Este plano alimentar foi gerado para fins educativos. Não substitui avaliação ou acompanhamento médico e nutricional profissional."`; 
    
    Dados do Usuário:
    - Nome: ${nome}
    - Peso: ${peso}kg
    - Calorias: ${calorias}kcal
    - Objetivo: ${objetivo}
    - Refeições: ${refeicoes}`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: promptCorrigido }],
        temperature: 0.7
      })
    });

    const aiData = await aiResponse.json();
    const dietaTexto = aiData.choices?.[0]?.message?.content;

    const caminhoPDF = await gerarPDF(dietaTexto, email);
    const nomeArquivoNoStorage = `dieta-${email.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.pdf`;

    const file = fs.readFileSync(caminhoPDF);
    await supabase.storage.from('dietas-pdf').upload(nomeArquivoNoStorage, file, { contentType: 'application/pdf', upsert: true });
    const { data: urlData } = supabase.storage.from('dietas-pdf').getPublicUrl(nomeArquivoNoStorage);

    await supabase.from('Usuarios_Dieta').update({ 
        pdf_url: urlData.publicUrl,
        debug_log: "Dieta gerada com sucesso."
    }).eq('email', email);

    return res.status(200).json({ success: true, url: urlData.publicUrl, dietaTexto: dietaTexto });

  } catch (error) {
    console.error('ERRO NO GERADOR:', error.message);
    return res.status(500).json({ error: "Erro ao gerar dieta. Tente novamente." });
  }
}
