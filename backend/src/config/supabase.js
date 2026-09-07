import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

export const isConfigured = Boolean(
  config.supabaseUrl &&
  config.supabaseAnonKey &&
  !config.supabaseUrl.includes('your-project') &&
  !config.supabaseAnonKey.includes('your-anon-key')
);

export const supabase = createClient(
  config.supabaseUrl || 'https://placeholder.supabase.co',
  config.supabaseAnonKey || 'placeholder-anon-key'
);

export const isSupabaseConfigured = () => isConfigured;

export const checkSupabaseConnection = async () => {
  if (!isConfigured) {
    console.log('Database (Supabase): Disconnected (Pending SUPABASE_URL and SUPABASE_ANON_KEY in .env)');
    return { connected: false, reason: 'Pending credentials in .env' };
  }

  try {
    const { error } = await supabase.from('_connection_check_').select('*').limit(1);

    if (error && (error.message?.includes('Invalid API key') || error.message?.includes('JWT') || error.message?.includes('fetch failed'))) {
      console.warn(`Database (Supabase): Disconnected (${error.message})`);
      return { connected: false, reason: error.message };
    }

    console.log('Database (Supabase): Connected successfully');
    return { connected: true };
  } catch (error) {
    console.warn(`Database (Supabase): Disconnected (${error.message})`);
    return { connected: false, reason: error.message };
  }
};