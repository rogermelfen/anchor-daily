// ============================================
// Anchor Daily - Analytics Service
// ============================================
// Lightweight, privacy-respecting analytics that tracks
// key events to help improve the app. All data is stored
// in the Supabase analytics_events table.
//
// Tracked events:
// - theme_selected: which focus area the user chose
// - reflection_viewed: user viewed a daily reflection
// - journal_saved: user saved a journal entry
// - paywall_viewed: user saw the paywall
// - subscription_started: user started trial or subscription
// - subscription_cancelled: user cancelled
// - app_opened: daily active user tracking
//
// No PII is stored in events — only user_id (UUID) and event metadata.

import { supabase } from './supabase';

export type AnalyticsEvent =
  | 'app_opened'
  | 'onboarding_completed'
  | 'theme_selected'
  | 'reflection_viewed'
  | 'journal_saved'
  | 'paywall_viewed'
  | 'paywall_dismissed'
  | 'subscription_started'
  | 'subscription_cancelled'
  | 'account_deleted'
  | 'push_enabled'
  | 'push_disabled'
  | 'focus_changed';

interface EventProperties {
  [key: string]: string | number | boolean | null;
}

/**
 * Track an analytics event.
 * Silently fails if the user is not authenticated or if
 * the insert fails — analytics should never break the app.
 */
export async function trackEvent(
  event: AnalyticsEvent,
  properties?: EventProperties
): Promise<void> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const userId = session?.user?.id || null;

    await supabase.from('analytics_events').insert({
      user_id: userId,
      event_name: event,
      properties: properties || {},
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    // Silently fail — analytics must never crash the app
    if (__DEV__) {
      console.log(`[analytics] ${event}`, properties);
    }
  }
}

/**
 * Track theme selection with the chosen focus area.
 */
export function trackThemeSelected(theme: string) {
  return trackEvent('theme_selected', { theme });
}

/**
 * Track reflection view with theme and reflection ID.
 */
export function trackReflectionViewed(reflectionId: string, theme: string) {
  return trackEvent('reflection_viewed', { reflection_id: reflectionId, theme });
}

/**
 * Track paywall view with source (where the user came from).
 */
export function trackPaywallViewed(source: string) {
  return trackEvent('paywall_viewed', { source });
}

/**
 * Track journal save.
 */
export function trackJournalSaved(wordCount: number) {
  return trackEvent('journal_saved', { word_count: wordCount });
}
