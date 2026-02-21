import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { supabase } from './supabase.js'; 

// Função auxiliar para esperar (delay)
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

    // Aguarda 2 segundos para garantir que o banco atualizou com os dados do App
    await delay(2000);

    // BUSCA RIGOROSA NO SUPABASE
    const { data: userDb, error: dbError } = await supabase
        .from('Usuarios_Dieta')
        .select('*')
        .eq('email', email)
        .single();

    if (dbError || !userDb) {
        throw new Error(`Usuário não encontrado no banco para buscar dados da dieta: ${email}`);
    }

    // Pega os dados do banco (prioridade) ou do corpo da requisição
    const peso = userDb.peso || body.peso;
    const objetivo = userDb.objetivo || body.objetivo;
    const calorias = userDb.meta_calorias || body.calorias;
    const nome = userDb.nome || body.nome || "Cliente";

    // LOG DE DEBUG PARA VOCÊ VER NO SUPABASE
    await supabase.from('Usuarios_Dieta').update({ 
        debug_log: `Dados recuperados: Peso=${peso}, Obj=${objetivo}, Kcal=${calorias}` 
    }).eq('email', email);

    // Se os dados essenciais ainda forem nulos, interrompemos para não gerar dieta errada
    if (!peso || !objetivo || !calorias) {
        throw new Error(`Dados incompletos no banco para ${email}. Peso: ${peso}, Obj: ${objetivo}, Kcal: ${calorias}`);
    }

    const promptCorrigido = `Você é um nutricionista esportivo. Crie uma dieta personalizada para ${nome}:
    - OBJETIVO ATUAL: ${objetivo}
    - PESO ATUAL: ${peso}
    - META DIÁRIA DE CALORIAS: ${calorias} kcal
    - NÚMERO DE REFEIÇÕES: ${userDb.refeicoes || 4}
    
    Use linguagem motivadora e profissional. Liste as refeições com horários sugestivos e quantidades.`;

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

    // Upload e link (usando sua função de storage)
    const file = fs.readFileSync(caminhoPDF);
    await supabase.storage.from('dietas-pdf').upload(nomeArquivoNoStorage, file, { contentType: 'application/pdf', upsert: true });
    const { data: urlData } = supabase.storage.from('dietas-pdf').getPublicUrl(nomeArquivoNoStorage);

    // Salva o link final e limpa o log de erro
    await supabase.from('Usuarios_Dieta').update({ 
        pdf_url: urlData.publicUrl,
        debug_log: "Dieta gerada com sucesso com os dados do usuário."
    }).eq('email', email);

    return res.status(200).json({ success: true, url: urlData.publicUrl });

  } catch (error) {
    console.error('ERRO NO GERADOR:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
