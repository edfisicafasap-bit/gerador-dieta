import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { supabase } from './supabase'; // importa o client Supabase

// Função para gerar o PDF
async function gerarPDF(conteudo, usuarioId) {
  const caminhoArquivo = path.join('/tmp', `dieta-${usuarioId}.pdf`);
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(caminhoArquivo);
  doc.pipe(stream);

  doc.fontSize(16).text(conteudo, { align: 'left' });
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(caminhoArquivo));
    stream.on('error', reject);
  });
}

// Função para fazer upload do PDF para Supabase e gerar link assinado
async function uploadPDFSupabase(caminhoLocal, nomeArquivo) {
  const file = fs.readFileSync(caminhoLocal);

  const { error } = await supabase
    .storage
    .from('dietas-pdf')
    .upload(nomeArquivo, file, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (error) throw error;

  const { data, error: signedError } = await supabase
    .storage
    .from('dietas-pdf')
    .createSignedUrl(nomeArquivo, 60 * 60 * 24); // link válido 24h

  if (signedError) throw signedError;

  return data.signedUrl;
}

// Função para salvar a URL do PDF no banco
async function salvarPDFUrlNoBanco(usuarioId, url) {
  const { error } = await supabase
    .from('Usuarios_Dieta')
    .update({ pdf_url: url })
    .eq('id', usuarioId);

  if (error) throw error;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { prompt, usuarioId } = req.body;

    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId é obrigatório' });
    }

    // 1️⃣ Chamar OpenAI para gerar a dieta
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
    const dietaTexto = data.choices?.[0]?.message?.content;

    if (!dietaTexto) {
      return res.status(500).json({ error: 'OpenAI não retornou uma resposta válida' });
    }

    // 2️⃣ Gerar PDF
    const caminhoPDF = await gerarPDF(dietaTexto, usuarioId);
    const nomeArquivo = `dieta-${usuarioId}.pdf`;

    // 3️⃣ Upload para Supabase e gerar link assinado
    const pdfUrl = await uploadPDFSupabase(caminhoPDF, nomeArquivo);

    // 4️⃣ Salvar link no banco
    await salvarPDFUrlNoBanco(usuarioId, pdfUrl);

    // 5️⃣ Retornar link para o frontend
    return res.status(200).json({
      message: 'PDF gerado e salvo com sucesso',
      pdfUrl,
      dietaTexto
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao gerar dieta ou PDF' });
  }
}
