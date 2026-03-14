import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'O e-mail é obrigatório.' });
        }

        const emailLimpo = email.toLowerCase().trim();

        // Buscamos apenas se existe um PDF para este e-mail
        const { data: usuario, error: dbError } = await supabase
            .from('Usuarios_Dieta')
            .select('pdf_url')
            .eq('email', emailLimpo)
            .maybeSingle();

        if (dbError) throw dbError;

        // Se o usuário não existe no banco
        if (!usuario) {
            return res.status(404).json({ error: 'Nenhum cadastro encontrado.' });
        }

        // Se o usuário existe, mas o campo pdf_url está vazio
        if (!usuario.pdf_url) {
            return res.status(404).json({ error: 'Você ainda não gerou o seu plano de Reeducação Alimentar.' });
        }

        // Se chegou aqui, o PDF existe. Retornamos o link direto.
        return res.status(200).json({ 
            pdf_url: usuario.pdf_url 
        });

    } catch (error) {
        console.error('Erro na busca:', error.message);
        return res.status(500).json({ error: 'Erro interno ao buscar plano.' });
    }
}
