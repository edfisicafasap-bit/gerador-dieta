import { supabase } from './supabase';

/**
 * Faz upload do conteúdo da dieta para o bucket 'dietas-pdf'
 * @param {string} conteudo - O texto da dieta gerado pela IA
 * @param {string} nomeArquivo - Nome do arquivo (ex: dieta-usuario.txt)
 * @returns {string} - Link assinado válido por 24h
 */
export async function uploadPDFSupabase(conteudo, nomeArquivo) {
  // Convertemos o texto em um Buffer (mais seguro para upload em nuvem)
  const fileBuffer = Buffer.from(conteudo, 'utf-8');

  const { error } = await supabase
    .storage
    .from('dietas-pdf')
    .upload(nomeArquivo, fileBuffer, {
      contentType: 'text/plain;charset=UTF-8',
      upsert: true 
    });

  if (error) throw error;

  // Gera o link assinado de 24 horas conforme seu código original
  const { data, error: signedError } = await supabase
    .storage
    .from('dietas-pdf')
    .createSignedUrl(nomeArquivo, 60 * 60 * 24); 

  if (signedError) throw signedError;

  return data.signedUrl;
}
