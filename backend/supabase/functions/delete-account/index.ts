// ============================================
// Anchor Daily - Delete Account Edge Function
// ============================================
// GDPR Article 17: Right to Erasure ("Right to be forgotten")
//
// This function:
// 1. Verifies the caller's JWT
// 2. Deletes all user data from public tables (journal_entries, users)
// 3. Deletes the user from auth.users (using service role)
// 4. Returns confirmation
//
// The user's data is permanently and irreversibly deleted.
// RevenueCat subscriptions are NOT cancelled automatically —
// the user must cancel via App Store / Google Play.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    // ---- Authenticate the caller ----
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Missing Authorization header' }, 401);
    }

    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await anonClient.auth.getUser();

    if (authError || !user) {
      return jsonResponse({ error: 'Invalid or expired token' }, 401);
    }

    const userId = user.id;
    const userEmail = user.email || 'unknown';

    console.log(`[delete-account] Starting deletion for user ${userId} (${userEmail})`);

    // ---- Use service role client for deletion ----
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Step 1: Delete journal entries
    const { error: journalError } = await serviceClient
      .from('journal_entries')
      .delete()
      .eq('user_id', userId);

    if (journalError) {
      console.error('[delete-account] Failed to delete journal entries:', journalError);
      return jsonResponse({ error: 'Failed to delete journal entries' }, 500);
    }
    console.log(`[delete-account] Deleted journal entries for ${userId}`);

    // Step 2: Delete user profile
    const { error: profileError } = await serviceClient
      .from('users')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('[delete-account] Failed to delete user profile:', profileError);
      return jsonResponse({ error: 'Failed to delete user profile' }, 500);
    }
    console.log(`[delete-account] Deleted user profile for ${userId}`);

    // Step 3: Delete from auth.users (permanently removes the account)
    const { error: authDeleteError } = await serviceClient.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error('[delete-account] Failed to delete auth user:', authDeleteError);
      return jsonResponse({ error: 'Failed to delete authentication account' }, 500);
    }
    console.log(`[delete-account] Deleted auth user ${userId}`);

    // ---- Success ----
    return jsonResponse({
      success: true,
      message: 'Your account and all associated data have been permanently deleted.',
    });
  } catch (err) {
    console.error('[delete-account] Unexpected error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});

function jsonResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
