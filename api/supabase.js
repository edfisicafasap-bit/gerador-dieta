import { createClient } from '@supabase/supabase-js';

// Verificação de segurança para te ajudar nos logs da Vercel
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("ERRO: Variáveis de ambiente do Supabase não configuradas na Vercel!");
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use sempre a SERVICE_ROLE no backend
);
