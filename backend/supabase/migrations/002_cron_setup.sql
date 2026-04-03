-- ============================================
-- Anchor Daily - Cron Job Setup
-- Migration 002: Schedule daily push notifications
-- ============================================
-- Note: pg_cron is available on Supabase Pro plan.
-- If you are on the free plan, use an external scheduler
-- (e.g., GitHub Actions, cron-job.org) to call the
-- send-daily-push Edge Function via HTTP.

-- Enable pg_cron extension (Supabase Pro only)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily push notification at 8:00 AM UTC
-- Adjust the time and timezone as needed for your user base.
-- SELECT cron.schedule(
--     'send-daily-push',
--     '0 8 * * *',
--     $$
--     SELECT net.http_post(
--         url := 'https://YOUR_PROJECT.supabase.co/functions/v1/send-daily-push',
--         headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
--     );
--     $$
-- );

-- Alternative: Use Supabase Dashboard > Database > Extensions > pg_cron
-- to set up the cron job via the UI.
