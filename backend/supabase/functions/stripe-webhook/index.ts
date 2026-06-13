// Supabase Edge Function — handles Stripe webhook events
// Deploy: supabase functions deploy stripe-webhook
// Secrets:
//   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
//   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature!, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err);
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) break;

        await supabase.from('users').update({
          subscription_status: 'trial',
          is_premium: true,
          trial_start_date: new Date().toISOString(),
          trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        }).eq('id', userId);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        const status = sub.status === 'active' ? 'active'
          : sub.status === 'trialing' ? 'trial'
          : sub.status === 'canceled' || sub.status === 'unpaid' ? 'expired'
          : null;

        if (status) {
          await supabase.from('users').update({
            subscription_status: status,
            is_premium: status === 'active' || status === 'trial',
          }).eq('id', userId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        await supabase.from('users').update({
          subscription_status: 'expired',
          is_premium: false,
        }).eq('id', userId);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const sub = invoice.subscription
          ? await stripe.subscriptions.retrieve(invoice.subscription as string)
          : null;
        const userId = sub?.metadata?.userId;
        if (!userId) break;

        await supabase.from('users').update({
          subscription_status: 'expired',
          is_premium: false,
        }).eq('id', userId);
        break;
      }

      default:
        console.log(`[stripe-webhook] Unhandled event: ${event.type}`);
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('[stripe-webhook] Error processing event:', error);
    return new Response('Internal error', { status: 500 });
  }
});
