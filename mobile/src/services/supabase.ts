// ============================================
// Anchor Daily - Supabase Client
// ============================================
// Reads credentials from app.config.ts -> extra,
// which in turn reads from environment variables.
// No hardcoded secrets in source code.

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

const SUPABASE_URL: string = extra.supabaseUrl;
const SUPABASE_ANON_KEY: string = extra.supabaseAnonKey;

if (!SUPABASE_URL || SUPABASE_URL === 'https://YOUR_PROJECT.supabase.co') {
  console.warn(
    '[Anchor Daily] Supabase URL is not configured. ' +
    'Set SUPABASE_URL in your .env file or EAS Secrets.'
  );
}

// Custom storage adapter using expo-secure-store for token persistence
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Silently fail - storage might not be available
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Silently fail
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
