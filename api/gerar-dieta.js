import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { supabase } from './supabase.js'; 

async function gerarPDF(conteudo, usuarioId) {
  const nomeLimpo = usuarioId.replace(/[^a-zA-Z0-9]/g, '_');
  const caminhoArquivo = path.join('/tmp', `dieta-${nomeLimpo}.pdf`);
  
  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(caminhoArquivo);

  return new Promise((resolve, reject) => {
    doc.pipe(stream);

    doc.font('Helvetica-Bold').fontSize(22).text('SEU PLANO ALIMENTAR', { align: 'center' });
    doc.moveDown();
    doc.font('Helvetica').fontSize(12).text(conteudo, {
      align: 'justify',
      lineGap: 5
    });
    
    doc.end();

    stream.on('finish', () => resolve(caminhoArquivo));
    stream.on('error', (err) => reject(err));
  });
}

async function uploadPDFSupabase(caminhoLocal, nomeArquivo) {
  const file = fs.readFileSync(caminhoLocal);

  const { error } = await supabase
    .storage
    .from('dietas-pdf') 
    .upload(nomeArquivo, file, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (error) throw new Error(`Erro no Upload Supabase: ${error.message}`);

  // ALTERAÇÃO: Usando PublicURL para o link não expirar em 24h
  // Certifique-se que seu bucket 'dietas-pdf' está como PUBLIC no Supabase
  const { data } = supabase.storage.from('dietas-pdf').getPublicUrl(nomeArquivo);
  
  return data.publicUrl;
}

async function salvarPDFUrlNoBanco(emailUsuario, url) {
  const { error } = await supabase
    .from('Usuarios_Dieta')
    .update({ pdf_url: url })
    .eq('email', emailUsuario.toLowerCase().trim());

  if (error) throw new Error(`Erro ao atualizar banco: ${error.message}`);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    // 1. Captura os dados desestruturados que vêm do seu Frontend
    const { usuarioId, peso, calorias, objetivo, refeicoes, alimentos, preparos } = req.body;

    if (!usuarioId) return res.status(400).json({ error: 'E-mail obrigatório' });

    // 2. Monta o Prompt com os dados da calculadora e dos alimentos
    const promptCorrigido = `Crie uma dieta detalhada para um usuário com:
    - Objetivo: ${objetivo}
    - Peso: ${peso}kg
    - Calorias: ${calorias}kcal
    - Refeições: ${refeicoes}
    - Alimentos escolhidos: ${alimentos ? alimentos.join(', ') : 'Variados'}
    - Preferência de preparo: ${preparos ? preparos.join(', ') : 'Geral'}
    Formate o texto de forma profissional para um PDF.`;

    // 3. Chamada OpenAI
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
    if (aiData.error) throw new Error(`OpenAI Error: ${aiData.error.message}`);

    const dietaTexto = aiData.choices?.[0]?.message?.content;
    if (!dietaTexto) throw new Error('IA retornou conteúdo vazio');

    // 4. PDF e Storage
    const caminhoPDF = await gerarPDF(dietaTexto, usuarioId);
    const nomeArquivoNoStorage = `dieta-${usuarioId.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.pdf`;

    const pdfUrl = await uploadPDFSupabase(caminhoPDF, nomeArquivoNoStorage);

    // 5. Salva no Banco (Aqui resolve o NULL)
    await salvarPDFUrlNoBanco(usuarioId, pdfUrl);

    if (fs.existsSync(caminhoPDF)) fs.unlinkSync(caminhoPDF);

    return res.status(200).json({
      message: 'Sucesso!',
      pdfUrl,
      dietaTexto
    });

  } catch (error) {
    console.error('ERRO NO BACKEND:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
