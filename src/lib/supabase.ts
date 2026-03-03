import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://udjnnqgwbxxzgzgdlmln.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_7WqY-5bu0o4eWz5RB7SoWA_bdHieQpW';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
