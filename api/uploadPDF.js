import { supabase } from './supabase.js';

/**
 * Faz upload do conteúdo da dieta para o bucket 'dietas-pdf'
 * @param {string} conteudo - O texto da dieta gerado pela IA
 * @param {string} nomeArquivo - Nome do arquivo (ex: dieta-usuario.pdf)
 * @returns {string} - Link público definitivo
 */
export async function uploadPDFSupabase(conteudo, nomeArquivo) {
  try {
    // Convertemos o texto em um Buffer
    const fileBuffer = Buffer.from(conteudo, 'utf-8');

    // Realiza o upload para o Supabase Storage
    const { error } = await supabase
      .storage
      .from('dietas-pdf')
      .upload(nomeArquivo, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true 
      });

    if (error) {
      console.error('Erro específico no upload do Supabase:', error);
      throw error;
    }

    // --- MUDANÇA AQUI: Trocamos SignedUrl por PublicUrl ---
    const { data } = supabase
      .storage
      .from('dietas-pdf')
      .getPublicUrl(nomeArquivo);

    if (!data || !data.publicUrl) {
      throw new Error('Não foi possível gerar a URL pública.');
    }

    return data.publicUrl;
    // -----------------------------------------------------

  } catch (err) {
    console.error('Falha crítica na função uploadPDFSupabase:', err.message);
    throw err;
  }
}
