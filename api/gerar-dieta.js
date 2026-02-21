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
    const { data: userDb } = await supabase
        .from('Usuarios_Dieta')
        .select('*')
        .eq('email', email)
        .single();

    // LÓGICA DE SEGURANÇA: Prioriza Banco, mas aceita Body (Plano B)
    const peso = userDb?.peso || body.peso;
    const objetivo = userDb?.objetivo || body.objetivo;
    const calorias = userDb?.meta_calorias || body.calorias;
    const nome = userDb?.nome || body.nome || "Cliente";
    const refeicoes = userDb?.refeicoes || body.refeicoes || 4;
    const alimentosLista = body.alimentos ? body.alimentos.join(', ') : "Variados";
    const preparosLista = body.preparos ? body.preparos.join(', ') : "A escolha";

    if (!peso || !objetivo || !calorias) {
        return res.status(400).json({ 
            error: "Dados técnicos não encontrados. Por favor, preencha o formulário novamente." 
        });
    }

    // MONTAGEM DO PROMPT COM AS VARIÁVEIS CORRETAS
    const promptFinal = `Atue como um Nutricionista Prático. Comece a resposta exatamente com este parágrafo: "Aqui está um plano de refeições de ${calorias} kcal para ${objetivo}, dividido em ${refeicoes} refeições, utilizando os alimentos que você selecionou.". 

Seu objetivo é converter listas de alimentos e macros em um cardápio culinário real, focado em "comida de verdade" e preparações reconhecíveis.

Gere um plano de ${calorias}kcal para ${objetivo}, dividido em ${refeicoes} refeições.
Use estes alimentos: ${alimentosLista}.
Preparos selecionados pelo usuário: ${preparosLista}.

DIRETRIZES SUPREMAS:
- DETERMINAÇÃO DE REFEIÇÕES: Gere EXATAMENTE ${refeicoes} refeições.
- CÁLCULO DA DIETA: A PROTEINA DEVE TER ENTRE 1.8 A 2.2g POR kg CORPORAL (Peso: ${peso}kg), Gordura 1g/kg e Carboidratos completam a meta de ${calorias}kcal.

PLANEJAMENTO ALIMENTAR ESTRUTURADO:
BLOCO 1: OPÇÕES A (PADRÃO com Arroz e Feijão)
BLOCO 2: OPÇÕES B (VARIAÇÃO sem Arroz e Feijão)

ITENS COMPLEMENTARES:
1. HIDRATAÇÃO: Recomendação de ${(parseFloat(peso) * 0.035).toFixed(1)}L de água por dia.
2. DATA: ${new Date().toLocaleDateString('pt-BR')}.

ACRESCENTE UM RODAPÉ: "Este plano alimentar foi gerado para fins educativos. Não substitui avaliação ou acompanhamento médico e nutricional profissional."`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: "Você é um nutricionista experiente." }, { role: "user", content: promptFinal }],
        temperature: 0.7
      })
    });

    const aiData = await aiResponse.json();
    const dietaTexto = aiData.choices?.[0]?.message?.content;

    if (!dietaTexto) throw new Error("A IA não retornou texto.");

    // PDF e STORAGE
    const caminhoPDF = await gerarPDF(dietaTexto, email);
    const nomeArquivoNoStorage = `dieta-${email.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.pdf`;
    const file = fs.readFileSync(caminhoPDF);

    await supabase.storage.from('dietas-pdf').upload(nomeArquivoNoStorage, file, { contentType: 'application/pdf', upsert: true });
    
    const { data: urlData } = supabase.storage.from('dietas-pdf').getPublicUrl(nomeArquivoNoStorage);

    // ATUALIZAÇÃO FINAL NO BANCO
    await supabase.from('Usuarios_Dieta').update({ 
        pdf_url: urlData.publicUrl,
        ultima_geracao: new Date().toISOString()
    }).eq('email', email);

    return res.status(200).json({ success: true, url: urlData.publicUrl, dietaTexto: dietaTexto });

  } catch (error) {
    console.error('ERRO NO GERADOR:', error);
    return res.status(500).json({ error: error.message });
  }
}
