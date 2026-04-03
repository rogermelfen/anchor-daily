// ============================================
// Anchor Daily Admin - Supabase Auth Client
// ============================================
// Uses ONLY the anon key (safe for browser).
// All data operations go through the admin-api Edge Function,
// which holds the service role key server-side.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL) {
  console.warn('[Admin] VITE_SUPABASE_URL is not set.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// Admin API helper — calls the Edge Function
// ============================================
const ADMIN_API_URL = `${SUPABASE_URL}/functions/v1/admin-api`;

async function getAuthToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || '';
}

export async function adminGet(resource: string): Promise<any[]> {
  const token = await getAuthToken();
  const res = await fetch(`${ADMIN_API_URL}?resource=${resource}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json.data;
}

export async function adminPost(body: Record<string, any>): Promise<any> {
  const token = await getAuthToken();
  const res = await fetch(ADMIN_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}
