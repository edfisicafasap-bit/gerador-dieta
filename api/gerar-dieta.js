import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Função para gerar o PDF
async function gerarPDF(conteudo, usuarioId) {
  // Caminho temporário do PDF no backend
  const caminhoArquivo = path.join('/tmp', `dieta-${usuarioId}.pdf`);
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(caminhoArquivo);
  doc.pipe(stream);

  // Adiciona o conteúdo da dieta
  doc.fontSize(16).text(conteudo, { align: 'left' });
  doc.end();

  // Retorna uma promise que resolve quando o PDF terminar de salvar
  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(caminhoArquivo));
    stream.on('error', reject);
  });
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

    // 2️⃣ Gerar PDF com a dieta
    const caminhoPDF = await gerarPDF(dietaTexto, usuarioId);

    // 3️⃣ Retornar resultado (por enquanto só caminho temporário)
    return res.status(200).json({
      message: 'PDF gerado com sucesso',
      caminhoPDF,
      dietaTexto
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao gerar dieta' });
  }
}
