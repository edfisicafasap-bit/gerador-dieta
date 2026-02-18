// api/uploadPDF.js
import fs from 'fs';
import { supabase } from './supabase';

/**
 * Faz upload de um PDF para o bucket 'dietas-pdf' no Supabase
 * @param {string} caminhoLocal - caminho do arquivo PDF temporário
 * @param {string} nomeArquivo - nome final do arquivo no bucket (ex: dieta-123.pdf)
 * @returns {string} - link assinado do PDF (válido 24h)
 */
export async function uploadPDFSupabase(caminhoLocal, nomeArquivo) {
  // Lê o arquivo PDF temporário
  const file = fs.readFileSync(caminhoLocal);

  // Upload para o bucket privado 'dietas-pdf'
  const { error } = await supabase
    .storage
    .from('dietas-pdf')
    .upload(nomeArquivo, file, {
      contentType: 'application/pdf',
      upsert: true // substitui se o arquivo já existir
    });

  if (error) throw error;

  // Gera link assinado para download (válido 24h)
  const { data, error: signedError } = await supabase
    .storage
    .from('dietas-pdf')
    .createSignedUrl(nomeArquivo, 60 * 60 * 24); // 24 horas

  if (signedError) throw signedError;

  return data.signedUrl;
}
