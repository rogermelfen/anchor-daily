// ============================================
// Anchor Daily - Admin API Edge Function
// ============================================
// This Edge Function acts as a secure proxy for all admin
// panel data operations. The Supabase SERVICE ROLE key lives
// here on the server — it is NEVER sent to the browser.
//
// The admin panel authenticates via Supabase Auth (anon key).
// This function verifies the caller's JWT, checks that the
// user's email is in the admin_users table, and then performs
// the requested operation with the service role client.
//
// Supported actions:
//   GET  /admin-api?resource=reflections
//   GET  /admin-api?resource=users
//   POST /admin-api  { action: "create_reflection", data: {...} }
//   POST /admin-api  { action: "update_reflection", id: "...", data: {...} }
//   POST /admin-api  { action: "delete_reflection", id: "..." }
//   POST /admin-api  { action: "toggle_reflection_status", id: "..." }

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ---- Authenticate the caller ----
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Missing Authorization header' }, 401);
    }

    // Verify the JWT using the anon client
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

    // ---- Check admin role ----
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: adminUser, error: adminError } = await serviceClient
      .from('admin_users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (adminError || !adminUser) {
      return jsonResponse({ error: 'Access denied. Not an admin user.' }, 403);
    }

    // ---- Route the request ----
    if (req.method === 'GET') {
      return handleGet(req, serviceClient);
    } else if (req.method === 'POST') {
      return handlePost(req, serviceClient);
    }

    return jsonResponse({ error: 'Method not allowed' }, 405);
  } catch (err) {
    console.error('Admin API error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});

// ============================================
// GET handler
// ============================================
async function handleGet(req: Request, client: any) {
  const url = new URL(req.url);
  const resource = url.searchParams.get('resource');

  if (resource === 'reflections') {
    const { data, error } = await client
      .from('reflections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return jsonResponse({ error: error.message }, 500);
    return jsonResponse({ data });
  }

  if (resource === 'users') {
    const { data, error } = await client
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return jsonResponse({ error: error.message }, 500);
    return jsonResponse({ data });
  }

  return jsonResponse({ error: 'Unknown resource' }, 400);
}

// ============================================
// POST handler
// ============================================
async function handlePost(req: Request, client: any) {
  const body = await req.json();
  const { action, id, data } = body;

  switch (action) {
    case 'create_reflection': {
      const { data: result, error } = await client
        .from('reflections')
        .insert(data)
        .select()
        .single();
      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ data: result });
    }

    case 'update_reflection': {
      const { error } = await client
        .from('reflections')
        .update(data)
        .eq('id', id);
      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ success: true });
    }

    case 'delete_reflection': {
      const { error } = await client
        .from('reflections')
        .delete()
        .eq('id', id);
      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ success: true });
    }

    case 'toggle_reflection_status': {
      // First fetch current status
      const { data: current, error: fetchErr } = await client
        .from('reflections')
        .select('status')
        .eq('id', id)
        .single();
      if (fetchErr) return jsonResponse({ error: fetchErr.message }, 500);

      const newStatus = current.status === 'published' ? 'draft' : 'published';
      const { error } = await client
        .from('reflections')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ success: true, newStatus });
    }

    default:
      return jsonResponse({ error: `Unknown action: ${action}` }, 400);
  }
}

// ============================================
// Helper
// ============================================
function jsonResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
