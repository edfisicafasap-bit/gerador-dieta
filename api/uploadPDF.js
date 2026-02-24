import { supabase } from './supabase.js';

/**
 * Faz upload do texto da dieta como arquivo no Supabase Storage
 * e retorna a URL pública
 */
export async function uploadPDFSupabase(conteudo, nomeArquivo) {
  try {
    const fileBuffer = Buffer.from(conteudo, 'utf-8');

    const { error } = await supabase
      .storage
      .from('dietas-pdf')
      .upload(nomeArquivo, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true 
      });

    if (error) throw error;

    const { data } = supabase
      .storage
      .from('dietas-pdf')
      .getPublicUrl(nomeArquivo);

    return data.publicUrl;

  } catch (err) {
    console.error('Erro no upload:', err.message);
    throw err;
  }
}
