import { createClient } from '@supabase/supabase-js';

// Inicializa o cliente do Supabase usando as variáveis de ambiente da Vercel
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    // Só permite requisições do tipo POST
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'O e-mail é obrigatório para a busca.' });
        }

        const emailLimpo = email.toLowerCase().trim();

        // Busca o usuário no banco de dados
        const { data: usuario, error: dbError } = await supabase
            .from('Usuarios_Dieta')
            .select('pdf_url, pago, tipo_plano')
            .eq('email', emailLimpo)
            .maybeSingle();

        if (dbError) throw dbError;

        // Verifica se o usuário existe e se tem um PDF gerado
        if (!usuario) {
            return res.status(404).json({ error: 'Nenhum cadastro encontrado com este e-mail.' });
        }

        if (!usuario.pago) {
            return res.status(403).json({ error: 'Este plano ainda não foi identificado como pago.' });
        }

        if (!usuario.pdf_url) {
            return res.status(404).json({ error: 'Você tem um plano ativo, mas ainda não gerou o seu PDF.' });
        }

        // Retorna o link do PDF para o front-end
        return res.status(200).json({ 
            pdf_url: usuario.pdf_url,
            tipo_plano: usuario.tipo_plano 
        });

    } catch (error) {
        console.error('Erro na busca:', error.message);
        return res.status(500).json({ error: 'Erro interno no servidor ao buscar plano.' });
    }
}
