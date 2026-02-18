import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { supabase } from './supabase'; // Certifique-se que este arquivo usa a SERVICE_ROLE_KEY

// 1. Função para gerar o PDF no diretório temporário da Vercel
async function gerarPDF(conteudo, usuarioId) {
  // Limpa o email para usar como nome de arquivo (remove @ e .)
  const nomeLimpo = usuarioId.replace(/[^a-zA-Z0-9]/g, '_');
  const caminhoArquivo = path.join('/tmp', `dieta-${nomeLimpo}.pdf`);
  
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(caminhoArquivo);
  doc.pipe(stream);

  // Formatação básica do PDF
  doc.fontSize(20).text('Seu Plano Alimentar', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(conteudo, { align: 'left' });
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(caminhoArquivo));
    stream.on('error', reject);
  });
}

// 2. Função para fazer upload do PDF para o Bucket do Supabase
async function uploadPDFSupabase(caminhoLocal, nomeArquivo) {
  const file = fs.readFileSync(caminhoLocal);

  const { error } = await supabase
    .storage
    .from('dietas-pdf') // Certifique-se que o bucket tem esse nome exato
    .upload(nomeArquivo, file, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (error) throw error;

  // Gera um link assinado válido por 24 horas
  const { data, error: signedError } = await supabase
    .storage
    .from('dietas-pdf')
    .createSignedUrl(nomeArquivo, 60 * 60 * 24);

  if (signedError) throw signedError;

  return data.signedUrl;
}

// 3. Função para salvar a URL no banco de dados usando o EMAIL como chave
async function salvarPDFUrlNoBanco(emailUsuario, url) {
  const { error } = await supabase
    .from('Usuarios_Dieta')
    .update({ pdf_url: url })
    .eq('email', emailUsuario); // MUDANÇA CRÍTICA: Busca por email, não por id

  if (error) throw error;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { prompt, usuarioId } = req.body; // usuarioId aqui deve receber o e-mail do frontend

    if (!usuarioId) {
      return res.status(400).json({ error: 'E-mail do usuário é obrigatório' });
    }

    // 1️⃣ Chamar OpenAI para gerar o texto da dieta
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
      return res.status(500).json({ error: 'A IA não retornou um conteúdo válido' });
    }

    // 2️⃣ Gerar o arquivo PDF fisicamente na Vercel
    const caminhoPDF = await gerarPDF(dietaTexto, usuarioId);
    const nomeArquivoNoStorage = `dieta-${usuarioId.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    // 3️⃣ Upload para o Storage do Supabase
    const pdfUrl = await uploadPDFSupabase(caminhoPDF, nomeArquivoNoStorage);

    // 4️⃣ Salvar o link gerado na linha do usuário no banco
    await salvarPDFUrlNoBanco(usuarioId, pdfUrl);

    // 5️⃣ Retornar tudo para o frontend
    return res.status(200).json({
      message: 'Sucesso!',
      pdfUrl,
      dietaTexto
    });

  } catch (error) {
    console.error('ERRO NO BACKEND:', error);
    return res.status(500).json({ error: 'Erro interno ao processar dieta e PDF' });
  }
}
