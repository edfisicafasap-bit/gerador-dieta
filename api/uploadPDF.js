import { supabase } from './supabase.js';

/**
 * Faz upload do conteúdo da dieta para o bucket 'dietas-pdf'
 * @param {string} conteudo - O texto da dieta gerado pela IA
 * @param {string} nomeArquivo - Nome do arquivo (ex: dieta-usuario.pdf)
 * @returns {string} - Link assinado válido por 24h
 */
export async function uploadPDFSupabase(conteudo, nomeArquivo) {
  try {
    // Convertemos o texto em um Buffer (padrão para upload de arquivos)
    const fileBuffer = Buffer.from(conteudo, 'utf-8');

    // Realiza o upload para o Supabase Storage
    const { error } = await supabase
      .storage
      .from('dietas-pdf')
      .upload(nomeArquivo, fileBuffer, {
        contentType: 'application/pdf', // Alterado de text/plain para application/pdf para evitar erro 415
        upsert: true 
      });

    if (error) {
      console.error('Erro específico no upload do Supabase:', error);
      throw error;
    }

    // Gera o link assinado de 24 horas para o usuário acessar
    const { data, error: signedError } = await supabase
      .storage
      .from('dietas-pdf')
      .createSignedUrl(nomeArquivo, 60 * 60 * 24); 

    if (signedError) {
      console.error('Erro ao gerar link assinado:', signedError);
      throw signedError;
    }

    return data.signedUrl;

  } catch (err) {
    console.error('Falha crítica na função uploadPDFSupabase:', err.message);
    throw err;
  }
}
