import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { supabase } from './supabase.js'; 

const delay = ms => new Promise(res => setTimeout(res, ms));

// Função para gerar o arquivo PDF no diretório temporário da Vercel
async function gerarPDF(conteudo, usuarioId) {
  const nomeLimpo = usuarioId.replace(/[^a-zA-Z0-9]/g, '_');
  const caminhoArquivo = path.join('/tmp', `dieta-${nomeLimpo}.pdf`);
  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(caminhoArquivo);

  return new Promise((resolve, reject) => {
    doc.pipe(stream);
    doc.font('Helvetica-Bold').fontSize(22).text('SEU PLANO ALIMENTAR', { align: 'center' });
    doc.moveDown();
    doc.font('Helvetica').fontSize(12).text(conteudo, { align: 'justify', lineGap: 5 });
    doc.end();
    stream.on('finish', () => resolve(caminhoArquivo));
    stream.on('error', (err) => reject(err));
  });
}

export default async function handler(req, res) {
  // 1. Bloqueia métodos que não sejam POST
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const body = req.body;
    const email = (body.usuarioId || body.email || "").toLowerCase().trim();
    if (!email) return res.status(400).json({ error: 'E-mail obrigatório' });

    // Pequena pausa para garantir que o registro do Passo 1 (frontend) foi escrito no banco
    await delay(1500);

    // 2. BUSCA DADOS NO SUPABASE
    const { data: userDb, error: dbError } = await supabase
        .from('Usuarios_Dieta')
        .select('*')
        .eq('email', email)
        .single();

    // Lógica de Segurança: Prioriza o que está no banco, mas usa o Body como fallback
    const peso = userDb?.peso || body.peso;
    const objetivo = userDb?.objetivo || body.objetivo;
    const calorias = userDb?.meta_calorias || body.calorias;
    const nome = userDb?.nome || body.nome || "Cliente";
    const refeicoes = userDb?.refeicoes || body.refeicoes || 4;
    const alimentosLista = body.alimentos ? body.alimentos.join(', ') : "Variados";
    const preparosLista = body.preparos ? body.preparos.join(', ') : "A escolha";

    if (!peso || !objetivo || !calorias) {
        return res.status(400).json({ 
            error: "Dados técnicos insuficientes. Preencha o formulário novamente." 
        });
    }

    // 3. MONTAGEM DO PROMPT PARA A OPENAI
    const promptFinal = `Atue como um Nutricionista Prático. Comece a resposta exatamente com este parágrafo: "Aqui está um plano de refeições de ${calorias} kcal para ${objetivo}, dividido em ${refeicoes} refeições, utilizando os alimentos que você selecionou.". 

Seu objetivo é converter listas de alimentos e macros em um cardápio culinário real, focado em "comida de verdade" e preparações reconhecíveis.

Gere um plano de ${calorias}kcal para ${objetivo}, dividido em ${refeicoes} refeições.
Use estes alimentos: ${alimentosLista}.
Preparos selecionados pelo usuário: ${preparosLista}.

DIRETRIZES SUPREMAS:
- DETERMINAÇÃO DE REFEIÇÕES: Gere EXATAMENTE ${refeicoes} refeições brasileiras coerentes.
- CÁLCULO: Proteína 2g/kg (Peso: ${peso}kg), Gordura 1g/kg, Carboidratos completam ${calorias}kcal.
- ESTRUTURA: Bloco 1 (Com arroz/feijão), Bloco 2 (Variações macros equivalentes).

HIDRATAÇÃO: Recomendação de ${(parseFloat(peso) * 0.035).toFixed(1)}L de água por dia.
DATA: ${new Date().toLocaleDateString('pt-BR')}.

RODAPÉ: "Este plano alimentar foi gerado para fins educativos. Não substitui avaliação ou acompanhamento médico e nutricional profissional."`;

    // 4. CHAMADA À API DA OPENAI
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "Você é um nutricionista experiente que cria cardápios práticos e realistas." },
            { role: "user", content: promptFinal }
        ],
        temperature: 0.7
      })
    });

    const aiData = await aiResponse.json();
    const dietaTexto = aiData.choices?.[0]?.message?.content;

    if (!dietaTexto) {
        console.error("Erro OpenAI:", aiData);
        throw new Error("A IA não retornou o plano alimentar.");
    }

    // 5. GERAÇÃO DO PDF E UPLOAD PARA O STORAGE
    const caminhoPDF = await gerarPDF(dietaTexto, email);
    const nomeArquivoNoStorage = `dieta-${email.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.pdf`;
    const file = fs.readFileSync(caminhoPDF);

    // Upload para o Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('dietas-pdf')
        .upload(nomeArquivoNoStorage, file, { 
            contentType: 'application/pdf', 
            upsert: true 
        });

    if (uploadError) {
        // Log para debug caso o bucket dê erro 404
        const { data: buckets } = await supabase.storage.listBuckets();
        console.error('Erro Upload:', uploadError);
        console.log('Buckets visíveis para o servidor:', buckets?.map(b => b.name));
        throw new Error(`Erro no Storage: ${uploadError.message}`);
    }
    
    // 6. PEGA A URL PÚBLICA E ATUALIZA O PERFIL DO USUÁRIO
    const { data: urlData } = supabase.storage.from('dietas-pdf').getPublicUrl(nomeArquivoNoStorage);

    await supabase.from('Usuarios_Dieta').update({ 
        pdf_url: urlData.publicUrl,
        ultima_geracao: new Date().toISOString()
    }).eq('email', email);

    // 7. RESPOSTA FINAL DE SUCESSO
    return res.status(200).json({ 
        success: true, 
        url: urlData.publicUrl, 
        dietaTexto: dietaTexto 
    });

  } catch (error) {
    console.error('FALHA GERAL NO GERADOR:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
