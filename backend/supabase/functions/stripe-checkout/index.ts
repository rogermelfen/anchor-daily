// Supabase Edge Function — creates a Stripe Checkout Session
// Deploy: supabase functions deploy stripe-checkout
// Secrets:
//   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
//   supabase secrets set STRIPE_MONTHLY_PRICE_ID=price_...
//   supabase secrets set STRIPE_YEARLY_PRICE_ID=price_...

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
const STRIPE_MONTHLY_PRICE_ID = Deno.env.get('STRIPE_MONTHLY_PRICE_ID')!;
const STRIPE_YEARLY_PRICE_ID = Deno.env.get('STRIPE_YEARLY_PRICE_ID')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { plan, userId, returnUrl, cancelUrl } = await req.json();

    if (!plan || !userId || !returnUrl) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    const priceId = plan === 'yearly' ? STRIPE_YEARLY_PRICE_ID : STRIPE_MONTHLY_PRICE_ID;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 14,
        metadata: { userId },
      },
      metadata: { userId },
      customer_email: userData?.email,
      success_url: returnUrl,
      cancel_url: cancelUrl || returnUrl,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    const msg = error?.message || String(error);
    console.error('[stripe-checkout] Error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
