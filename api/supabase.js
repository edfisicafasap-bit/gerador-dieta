// api/supabase.js
import { createClient } from '@supabase/supabase-js';

// Cria o client do Supabase usando variáveis de ambiente
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
