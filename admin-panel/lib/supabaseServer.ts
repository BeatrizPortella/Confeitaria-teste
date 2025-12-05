import { createClient } from '@supabase/supabase-js';

// Para operações no servidor que exigem Service Role (como seed, admin actions)
// continuamos usando supabase-js padrão, pois @supabase/ssr é focado em cookies/nextjs context.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);
