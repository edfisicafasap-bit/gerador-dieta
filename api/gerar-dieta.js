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

    await delay(1500);

    const { data: userDb } = await supabase
        .from('Usuarios_Dieta')
        .select('*')
        .eq('email', email)
        .single();

    // Lógica de fallback: Se não estiver no banco, pega do corpo da requisição
    const peso = userDb?.peso || body.peso;
    const objetivo = userDb?.objetivo || body.objetivo;
    const calorias = userDb?.meta_calorias || body.calorias;
    const nome = userDb?.nome || body.nome || "Cliente";
    const refeicoes = userDb?.refeicoes || body.refeicoes || 4;
    const alimentosLista = body.alimentos ? body.alimentos.join(', ') : "Variados";
    const preparosLista = body.preparos ? body.preparos.join(', ') : "A escolha";

    if (!peso || !objetivo || !calorias) {
        return res.status(400).json({ error: "Dados insuficientes para gerar a dieta." });
    }

    const promptFinal = `Atue como um Nutricionista Prático. Comece a resposta exatamente com: "Aqui está um plano de refeições de ${calorias} kcal para ${objetivo}, dividido em ${refeicoes} refeições, utilizando os alimentos que você selecionou.". 
    Gere um plano de ${calorias}kcal para ${objetivo}, dividido em ${refeicoes} refeições brasileiras. 
    Use estes alimentos: ${alimentosLista}. Preparos: ${preparosLista}. Peso: ${peso}kg. 
    Calcule 2g/kg de proteína. Finalize com recomendação de água: ${(parseFloat(peso) * 0.035).toFixed(1)}L.`;

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
    if (!dietaTexto) throw new Error("A IA não retornou o plano.");

    const caminhoPDF = await gerarPDF(dietaTexto, email);
    const nomeArquivoNoStorage = `dieta-${email.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.pdf`;
    const file = fs.readFileSync(caminhoPDF);

    const { error: uploadError } = await supabase.storage.from('dietas-pdf').upload(nomeArquivoNoStorage, file, { contentType: 'application/pdf', upsert: true });
    if (uploadError) throw new Error(`Erro Storage: ${uploadError.message}`);
    
    const { data: urlData } = supabase.storage.from('dietas-pdf').getPublicUrl(nomeArquivoNoStorage);

    // --- PASSO 6 CORRIGIDO: SALVANDO TUDO NO BANCO ---
    const { error: updateError } = await supabase
      .from('Usuarios_Dieta')
      .update({ 
          pdf_url: urlData.publicUrl,
          peso: peso,
          objetivo: objetivo,
          meta_calorias: calorias,
          nome: nome,
          refeicoes: refeicoes,
          ultima_geracao: new Date().toISOString()
      })
      .eq('email', email);

    if (updateError) console.error("Erro ao atualizar colunas:", updateError);

    return res.status(200).json({ success: true, url: urlData.publicUrl, dietaTexto: dietaTexto });

  } catch (error) {
    console.error('FALHA:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
