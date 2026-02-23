import { supabase } from './supabase.js';
import { jsPDF } from 'jspdf'; // Faltava importar a biblioteca!

/**
 * Transforma texto em PDF REAL e faz upload para o Supabase
 */
export async function uploadPDFSupabase(conteudo, nomeArquivo) {
  try {
    // 1. CRIA O PDF DE VERDADE (O que faltava!)
    const doc = new jsPDF();
    
    // Limpa caracteres estranhos que podem quebrar o PDF
    const textoLimpo = conteudo.replace(/[#*]/g, '');
    
    // Configura margens e quebra de linha automática
    const larguraMax = 180;
    const linhas = doc.splitTextToSize(textoLimpo, larguraMax);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(linhas, 10, 20);

    // 2. CONVERTE PARA O FORMATO QUE O SUPABASE ACEITA
    const pdfArrayBuffer = doc.output('arraybuffer');
    const fileBuffer = Buffer.from(pdfArrayBuffer);

    // 3. FAZ O UPLOAD
    const { error } = await supabase
      .storage
      .from('dietas-pdf')
      .upload(nomeArquivo, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true 
      });

    if (error) throw error;

    // 4. GERA A URL PÚBLICA (Melhor que a assinada para evitar erros de token)
    const { data } = supabase
      .storage
      .from('dietas-pdf')
      .getPublicUrl(nomeArquivo);

    return data.publicUrl;

  } catch (err) {
    console.error('Erro na geração do PDF real:', err.message);
    throw err;
  }
}
