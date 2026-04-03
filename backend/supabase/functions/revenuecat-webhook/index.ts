// ============================================
// Anchor Daily - RevenueCat Webhook Handler
// Supabase Edge Function
// ============================================
// This function receives webhook events from RevenueCat
// and updates the user's subscription status in the database.
//
// Security: Verifies the webhook using HMAC-SHA256 signature
// (RevenueCat sends this in the X-RevenueCat-Signature header)
// AND falls back to Bearer token check for compatibility.
//
// Deploy: supabase functions deploy revenuecat-webhook
// Set secrets:
//   supabase secrets set REVENUECAT_WEBHOOK_SECRET=your_bearer_token
//   supabase secrets set REVENUECAT_WEBHOOK_SIGNING_KEY=your_signing_key

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const REVENUECAT_WEBHOOK_SECRET = Deno.env.get('REVENUECAT_WEBHOOK_SECRET') || '';
const REVENUECAT_WEBHOOK_SIGNING_KEY = Deno.env.get('REVENUECAT_WEBHOOK_SIGNING_KEY') || '';

/**
 * Verify RevenueCat HMAC-SHA256 webhook signature.
 * RevenueCat sends the signature in the header as:
 *   X-RevenueCat-Signature: v1=<hex-encoded HMAC-SHA256>
 *
 * The HMAC is computed over the raw request body using
 * the webhook signing key from the RevenueCat dashboard.
 */
async function verifySignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  if (!REVENUECAT_WEBHOOK_SIGNING_KEY) {
    console.warn('[webhook] No signing key configured — skipping HMAC verification');
    return true; // Allow if not configured (dev mode)
  }

  if (!signatureHeader) {
    console.error('[webhook] Missing X-RevenueCat-Signature header');
    return false;
  }

  // Parse "v1=<hex>" format
  const match = signatureHeader.match(/^v1=([a-f0-9]+)$/i);
  if (!match) {
    console.error('[webhook] Invalid signature format:', signatureHeader);
    return false;
  }

  const receivedHex = match[1];

  // Compute expected HMAC-SHA256
  const encoder = new TextEncoder();
  const keyData = encoder.encode(REVENUECAT_WEBHOOK_SIGNING_KEY);
  const bodyData = encoder.encode(rawBody);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, bodyData);
  const expectedHex = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time comparison to prevent timing attacks
  if (receivedHex.length !== expectedHex.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < receivedHex.length; i++) {
    result |= receivedHex.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Verify Bearer token (legacy / fallback method).
 */
function verifyBearerToken(authHeader: string | null): boolean {
  if (!REVENUECAT_WEBHOOK_SECRET) {
    return true; // Allow if not configured
  }
  return authHeader === `Bearer ${REVENUECAT_WEBHOOK_SECRET}`;
}

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Read raw body for signature verification
    const rawBody = await req.text();

    // ---- Verify authenticity ----
    const signatureHeader = req.headers.get('X-RevenueCat-Signature');
    const authHeader = req.headers.get('Authorization');

    // Prefer HMAC signature if signing key is configured
    if (REVENUECAT_WEBHOOK_SIGNING_KEY) {
      const signatureValid = await verifySignature(rawBody, signatureHeader);
      if (!signatureValid) {
        console.error('[webhook] HMAC signature verification failed');
        return new Response('Unauthorized — invalid signature', { status: 401 });
      }
      console.log('[webhook] HMAC signature verified');
    } else {
      // Fall back to Bearer token
      if (!verifyBearerToken(authHeader)) {
        console.error('[webhook] Bearer token verification failed');
        return new Response('Unauthorized', { status: 401 });
      }
      console.log('[webhook] Bearer token verified');
    }

    // ---- Parse event ----
    const body = JSON.parse(rawBody);
    const event = body.event;

    if (!event) {
      return new Response('No event data', { status: 400 });
    }

    const appUserId = event.app_user_id;
    const eventType = event.type;

    if (!appUserId) {
      return new Response('No app_user_id', { status: 400 });
    }

    // Create Supabase admin client (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let updateData: Record<string, any> = {};

    switch (eventType) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'PRODUCT_CHANGE':
        updateData = {
          is_premium: true,
          subscription_status: 'active',
        };
        break;

      case 'TRIAL_STARTED':
        updateData = {
          is_premium: true,
          subscription_status: 'trial',
          trial_start_date: new Date().toISOString(),
          trial_end_date: new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000
          ).toISOString(),
        };
        break;

      case 'CANCELLATION':
      case 'SUBSCRIPTION_PAUSED':
        updateData = {
          subscription_status: 'cancelled',
        };
        break;

      case 'EXPIRATION':
        updateData = {
          is_premium: false,
          subscription_status: 'expired',
        };
        break;

      case 'BILLING_ISSUE':
        updateData = {
          subscription_status: 'expired',
          is_premium: false,
        };
        break;

      default:
        console.log(`[webhook] Unhandled event type: ${eventType}`);
        return new Response('OK', { status: 200 });
    }

    // Update user record
    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', appUserId);

    if (error) {
      console.error('[webhook] Error updating user:', error);
      return new Response('Database error', { status: 500 });
    }

    console.log(`[webhook] Updated user ${appUserId} for event ${eventType}`);
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('[webhook] Unexpected error:', error);
    return new Response('Internal error', { status: 500 });
  }
});
