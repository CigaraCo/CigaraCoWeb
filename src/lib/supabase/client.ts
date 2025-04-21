
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if the required environment variables are available
const hasSupabaseCredentials = supabaseUrl && supabaseAnonKey;

// Create the Supabase client only if credentials are available
export const supabase = hasSupabaseCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Log warning if credentials are missing
if (!hasSupabaseCredentials) {
  console.warn(
    'Supabase connection cannot be established. Missing environment variables: ' +
    (!supabaseUrl ? 'VITE_SUPABASE_URL ' : '') +
    (!supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : '') +
    '. Please set these in your environment.'
  );
}
