import { supabase } from './supabase.js';

/**
 * Gera um PDF válido em Node.js (sem dependências de navegador)
 * e faz upload para o Supabase Storage
 */
export async function uploadPDFSupabase(conteudo, nomeArquivo) {
  try {
    // 1. GERAR PDF MANUALMENTE (compatível com Node.js / Vercel serverless)
    const textoLimpo = conteudo.replace(/[#*]/g, '');
    const pdfBuffer = gerarPDFpuro(textoLimpo);

    // 2. FAZ O UPLOAD
    const { error } = await supabase
      .storage
      .from('dietas-pdf')
      .upload(nomeArquivo, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true 
      });

    if (error) throw error;

    // 3. GERA A URL PÚBLICA
    const { data } = supabase
      .storage
      .from('dietas-pdf')
      .getPublicUrl(nomeArquivo);

    return data.publicUrl;

  } catch (err) {
    console.error('Erro no upload do PDF:', err.message);
    throw err;
  }
}

/**
 * Gera um PDF válido usando apenas strings (sem jsPDF, sem Canvas, sem DOM)
 * Funciona em Node.js puro — compatível com Vercel Serverless
 */
function gerarPDFpuro(texto) {
  const linhas = quebrarTextoEmLinhas(texto, 90);
  const linhasPorPagina = 50;
  const paginas = [];

  for (let i = 0; i < linhas.length; i += linhasPorPagina) {
    paginas.push(linhas.slice(i, i + linhasPorPagina));
  }

  if (paginas.length === 0) paginas.push(['Plano Alimentar']);

  let objNum = 0;
  const objetos = [];

  function addObj(conteudoObj) {
    objNum++;
    objetos.push({ num: objNum, conteudo: conteudoObj });
    return objNum;
  }

  // Obj 1 - Catálogo
  const catalogoNum = addObj('<<\n/Type /Catalog\n/Pages 2 0 R\n>>');

  // Obj 2 - Páginas (placeholder, será atualizado)
  const pagesNum = addObj(''); // será substituído depois

  // Obj 3 - Fonte
  const fontNum = addObj('<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n/Encoding /WinAnsiEncoding\n>>');

  const pageObjNums = [];

  for (const paginaLinhas of paginas) {
    // Stream de conteúdo
    let stream = 'BT\n/F1 11 Tf\n40 780 Td\n14 TL\n';
    for (const linha of paginaLinhas) {
      const linhaEscapada = linha
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/[^\x20-\x7E]/g, ' '); // remove caracteres não-ASCII para evitar erros
      stream += `(${linhaEscapada}) Tj T*\n`;
    }
    stream += 'ET';

    const streamNum = addObj(
      `<<\n/Length ${Buffer.byteLength(stream, 'latin1')}\n>>\nstream\n${stream}\nendstream`
    );

    const pageNum = addObj(
      `<<\n/Type /Page\n/Parent ${pagesNum} 0 R\n/MediaBox [0 0 595 842]\n/Contents ${streamNum} 0 R\n/Resources <<\n/Font <<\n/F1 ${fontNum} 0 R\n>>\n>>\n>>`
    );
    pageObjNums.push(pageNum);
  }

  // Atualizar Pages object
  const kidsStr = pageObjNums.map(n => `${n} 0 R`).join(' ');
  objetos[pagesNum - 1].conteudo = `<<\n/Type /Pages\n/Kids [${kidsStr}]\n/Count ${pageObjNums.length}\n>>`;

  // Montar PDF
  let pdf = '%PDF-1.4\n';
  const offsets = [];

  for (const obj of objetos) {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${obj.num} 0 obj\n${obj.conteudo}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<<\n/Size ${objetos.length + 1}\n/Root ${catalogoNum} 0 R\n>>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'latin1');
}

/**
 * Quebra texto longo em linhas de tamanho máximo
 */
function quebrarTextoEmLinhas(texto, maxChars) {
  const linhasOriginais = texto.split('\n');
  const resultado = [];

  for (const linha of linhasOriginais) {
    if (linha.length <= maxChars) {
      resultado.push(linha);
    } else {
      const palavras = linha.split(' ');
      let linhaAtual = '';
      for (const palavra of palavras) {
        if ((linhaAtual + ' ' + palavra).trim().length > maxChars) {
          resultado.push(linhaAtual.trim());
          linhaAtual = palavra;
        } else {
          linhaAtual += ' ' + palavra;
        }
      }
      if (linhaAtual.trim()) resultado.push(linhaAtual.trim());
    }
  }

  return resultado;
}
