import { supabase } from './supabase.js';
import { jsPDF } from 'jspdf';

/**
 * Transforma texto em PDF com múltiplas páginas e faz upload para o Supabase
 */
export async function uploadPDFSupabase(conteudo, nomeArquivo) {
  try {
    const doc = new jsPDF();
    
    // LIMPEZA REFORÇADA: Remove negritos (**), títulos (#) e asteriscos soltos (*)
    // O uso de regex garante que remova todas as ocorrências de forma limpa.
    const textoLimpo = conteudo
      .replace(/\*\*/g, '')  // Remove negrito
      .replace(/#/g, '')     // Remove hashtags de títulos
      .replace(/\*/g, '')    // Remove asteriscos restantes
      .trim();
    
    const larguraMax = 180;
    const linhas = doc.splitTextToSize(textoLimpo, larguraMax);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11); // Reduzi levemente para caber melhor o conteúdo técnico

    let y = 20; // Posição vertical inicial
    const margemSuperior = 20;
    const limitePagina = 275; // Limite antes de criar nova página

    linhas.forEach(linha => {
        // Se a próxima linha ultrapassar o limite, cria nova página
        if (y > limitePagina) {
            doc.addPage();
            y = margemSuperior; // Reseta o cursor para o topo da nova página
        }
        
        // Adiciona a linha ao documento
        doc.text(linha, 15, y);
        y += 7; // Espaçamento entre linhas
    });

    // Converte para Buffer para o Supabase
    const pdfArrayBuffer = doc.output('arraybuffer');
    const fileBuffer = Buffer.from(pdfArrayBuffer);

    // Upload para o Bucket 'dietas-pdf'
    const { error } = await supabase
      .storage
      .from('dietas-pdf')
      .upload(nomeArquivo, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true 
      });

    if (error) throw error;

    // Retorna a URL pública para o usuário baixar
    const { data } = supabase
      .storage
      .from('dietas-pdf')
      .getPublicUrl(nomeArquivo);

    return data.publicUrl;

  } catch (error) {
    console.error('Erro ao gerar/enviar PDF:', error);
    throw new Error('Falha na criação do arquivo PDF.');
  }
}
