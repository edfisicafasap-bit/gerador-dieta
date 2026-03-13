import { supabase } from './supabase.js';

export default async function handler(req, res) {
    // Garante que apenas requisições POST sejam aceitas
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'O e-mail é obrigatório para a busca.' });
        }

        const emailLimpo = email.toLowerCase().trim();

        // Busca apenas as informações necessárias: a URL do PDF e a data
        const { data: usuario, error: userError } = await supabase
            .from('Usuarios_Dieta')
            .select('pdf_url, ultima_geracao, tipo_plano')
            .eq('email', emailLimpo)
            .maybeSingle();

        if (userError) throw userError;

        // Se o usuário existir e já tiver um PDF gerado
        if (usuario && usuario.pdf_url) {
            return res.status(200).json({ 
                sucesso: true,
                pdf_url: usuario.pdf_url,
                ultima_geracao: usuario.ultima_geracao
            });
        } else {
            // Caso o e-mail não esteja no banco ou ainda não gerou o PDF
            return res.status(404).json({ 
                error: 'Nenhuma Reeducação Alimentar encontrada para este e-mail.' 
            });
        }

    } catch (error) {
        console.error('Erro na busca:', error.message);
        return res.status(500).json({ 
            error: 'Erro interno ao buscar os dados.' 
        });
    }
}
