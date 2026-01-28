import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug para verificar se as variáveis estão sendo carregadas
console.log('Supabase Config:', {
  url: supabaseUrl ? 'Definida' : 'Indefinida',
  key: supabaseAnonKey ? 'Definida' : 'Indefinida',
  // Mostrar apenas o início da URL para confirmar que é a correta sem vazar tudo
  urlPrefix: supabaseUrl?.substring(0, 15)
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERRO CRÍTICO: Variáveis de ambiente do Supabase não encontradas!');
  console.error('Verifique se o arquivo .env contém VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
  throw new Error('Supabase URL and Anon Key are required.');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);
