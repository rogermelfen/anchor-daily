// Web version — uses localStorage instead of expo-secure-store
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};
const SUPABASE_URL: string = extra.supabaseUrl || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY: string = extra.supabaseAnonKey || 'placeholder';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
