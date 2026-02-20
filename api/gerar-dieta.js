import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { supabase } from './supabase.js'; 

async function gerarPDF(conteudo, usuarioId) {
  const nomeLimpo = usuarioId.replace(/[^a-zA-Z0-9]/g, '_');
  const caminhoArquivo = path.join('/tmp', `dieta-${nomeLimpo}-${Date.now()}.pdf`);
  
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

async function uploadPDFSupabase(caminhoLocal, nomeArquivo) {
  const file = fs.readFileSync(caminhoLocal);
  const { error } = await supabase.storage.from('dietas-pdf').upload(nomeArquivo, file, {
      contentType: 'application/pdf',
      upsert: true
  });

  if (error) throw new Error(`Erro Upload: ${error.message}`);

  const { data, error: signedError } = await supabase.storage.from('dietas-pdf').createSignedUrl(nomeArquivo, 60 * 60 * 24);
  if (signedError) throw signedError;
  return data.signedUrl;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const { prompt, usuarioId } = req.body;
    if (!usuarioId) return res.status(400).json({ error: 'E-mail obrigatório' });

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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

    const aiData = await aiResponse.json();
    if (aiData.error) throw new Error(aiData.error.message);

    const dietaTexto = aiData.choices?.[0]?.message?.content;
    if (!dietaTexto) throw new Error('IA vazia');

    const caminhoPDF = await gerarPDF(dietaTexto, usuarioId);
    const nomeArquivo = `dieta-${usuarioId.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.pdf`;
    const pdfUrl = await uploadPDFSupabase(caminhoPDF, nomeArquivo);

    // ATUALIZA O BANCO DE DADOS
    await supabase.from('Usuarios_Dieta').update({ pdf_url: pdfUrl }).eq('email', usuarioId.toLowerCase().trim());

    if (fs.existsSync(caminhoPDF)) fs.unlinkSync(caminhoPDF);

    return res.status(200).json({ pdfUrl, dietaTexto });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
