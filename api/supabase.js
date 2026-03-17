import { createClient } from '@supabase/supabase-js';

// Verificação de segurança para o log da Vercel
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("ERRO: Variáveis de ambiente ausentes!");
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
