-- ============================================
-- Anchor Daily - Analytics Events Table
-- ============================================
-- Lightweight event tracking for understanding user behavior.
-- No PII is stored — only user_id (UUID) and event metadata.

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying events by name and date
CREATE INDEX idx_analytics_event_name ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_user_id ON public.analytics_events(user_id);

-- RLS: users can insert their own events, only service role can read all
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can insert events (their own user_id or anonymous)
CREATE POLICY "Users can insert own events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (
    user_id IS NULL OR user_id = auth.uid()
  );

-- Users cannot read analytics (admin-only via service role)
-- No SELECT policy for authenticated users

-- ============================================
-- Analytics Views for Admin Dashboard
-- ============================================

-- Daily active users
CREATE OR REPLACE VIEW public.analytics_daily_active AS
SELECT
  DATE(created_at) AS day,
  COUNT(DISTINCT user_id) AS active_users
FROM public.analytics_events
WHERE event_name = 'app_opened'
GROUP BY DATE(created_at)
ORDER BY day DESC;

-- Theme selection distribution
CREATE OR REPLACE VIEW public.analytics_theme_distribution AS
SELECT
  properties->>'theme' AS theme,
  COUNT(*) AS selections
FROM public.analytics_events
WHERE event_name = 'theme_selected'
GROUP BY properties->>'theme'
ORDER BY selections DESC;

-- Conversion funnel: onboarding -> paywall view -> subscription
CREATE OR REPLACE VIEW public.analytics_conversion_funnel AS
SELECT
  (SELECT COUNT(DISTINCT user_id) FROM public.analytics_events WHERE event_name = 'onboarding_completed') AS onboarded,
  (SELECT COUNT(DISTINCT user_id) FROM public.analytics_events WHERE event_name = 'paywall_viewed') AS saw_paywall,
  (SELECT COUNT(DISTINCT user_id) FROM public.analytics_events WHERE event_name = 'subscription_started') AS subscribed;

-- Journal engagement
CREATE OR REPLACE VIEW public.analytics_journal_engagement AS
SELECT
  DATE(created_at) AS day,
  COUNT(*) AS entries_saved,
  COUNT(DISTINCT user_id) AS unique_writers,
  AVG((properties->>'word_count')::int) AS avg_word_count
FROM public.analytics_events
WHERE event_name = 'journal_saved'
GROUP BY DATE(created_at)
ORDER BY day DESC;
