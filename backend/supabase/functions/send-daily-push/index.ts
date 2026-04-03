// ============================================
// Anchor Daily - Daily Push Notification Sender
// Supabase Edge Function
// ============================================
// This function sends daily push notifications to all users
// who have push_enabled = true. It should be triggered by a
// cron job (e.g., Supabase pg_cron or external scheduler).
//
// Deploy: supabase functions deploy send-daily-push

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
}

serve(async (req: Request) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch all users with push enabled and a valid token
    const { data: users, error } = await supabase
      .from('users')
      .select('id, push_token')
      .eq('push_enabled', true)
      .not('push_token', 'is', null);

    if (error) {
      console.error('Error fetching users:', error);
      return new Response('Database error', { status: 500 });
    }

    if (!users || users.length === 0) {
      return new Response('No users to notify', { status: 200 });
    }

    // Build Expo push messages
    const messages: ExpoPushMessage[] = users.map((user) => ({
      to: user.push_token!,
      title: 'Your daily moment is ready',
      body: 'Take a quiet moment to reflect and find peace in your day.',
      data: { screen: 'Today' },
      sound: 'default',
    }));

    // Send to Expo Push API in batches of 100
    const BATCH_SIZE = 100;
    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch = messages.slice(i, i + BATCH_SIZE);

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(batch),
      });

      if (!response.ok) {
        console.error('Expo push error:', await response.text());
      }
    }

    console.log(`Sent push notifications to ${users.length} users`);
    return new Response(`Sent to ${users.length} users`, { status: 200 });
  } catch (error) {
    console.error('Push notification error:', error);
    return new Response('Internal error', { status: 500 });
  }
});
