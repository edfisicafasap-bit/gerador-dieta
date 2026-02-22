import { supabase } from './supabase.js';

/**
 * Faz upload do conteúdo da dieta para o bucket 'dietas-pdf'
 */
export async function uploadPDFSupabase(conteudo, nomeArquivo) {
  // Convertemos o texto em um Buffer
  const fileBuffer = Buffer.from(conteudo, 'utf-8');

  // AJUSTE AQUI: Mudamos de 'text/plain;charset=UTF-8' para apenas 'text/plain'
  const { error } = await supabase
    .storage
    .from('dietas-pdf')
    .upload(nomeArquivo, fileBuffer, {
      contentType: 'text/plain', // Simplificado para evitar erro 415
      upsert: true 
    });

  if (error) {
    console.error('Erro no upload para o Storage:', error);
    throw error;
  }

  // Gera o link assinado de 24 horas
  const { data, error: signedError } = await supabase
    .storage
    .from('dietas-pdf')
    .createSignedUrl(nomeArquivo, 60 * 60 * 24); 

  if (signedError) throw signedError;

  return data.signedUrl;
}
