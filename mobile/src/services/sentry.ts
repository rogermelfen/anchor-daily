// ============================================
// Anchor Daily - Sentry Error Tracking
// ============================================
// Initializes Sentry for crash reporting and performance
// monitoring in production builds.
//
// Setup:
// 1. Create a free Sentry account at https://sentry.io
// 2. Create a React Native project
// 3. Copy the DSN and add it to your .env file as SENTRY_DSN
// 4. Install: npx expo install @sentry/react-native
//
// This module is a thin wrapper so the rest of the app
// doesn't need to import Sentry directly.

import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const SENTRY_DSN = Constants.expoConfig?.extra?.sentryDsn || '';

export function initSentry() {
  if (!SENTRY_DSN) {
    console.log('[Sentry] No DSN configured — error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    // Set to false in development, true in production
    enabled: !__DEV__,
    // Performance monitoring sample rate (0.0 to 1.0)
    tracesSampleRate: 0.2,
    // Only send errors in production
    beforeSend(event) {
      if (__DEV__) return null;
      return event;
    },
  });

  console.log('[Sentry] Initialized.');
}

/**
 * Capture an exception manually.
 * Use this in catch blocks for non-fatal errors.
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (!SENTRY_DSN || __DEV__) {
    console.error('[Sentry] Would capture:', error.message, context);
    return;
  }

  if (context) {
    Sentry.setContext('extra', context);
  }
  Sentry.captureException(error);
}

/**
 * Log a breadcrumb for debugging context.
 */
export function addBreadcrumb(message: string, category?: string) {
  Sentry.addBreadcrumb({
    message,
    category: category || 'app',
    level: 'info',
  });
}

/**
 * Identify the current user for error reports.
 */
export function setUser(userId: string, email?: string) {
  Sentry.setUser({ id: userId, email });
}

/**
 * Clear user identity (on sign out).
 */
export function clearUser() {
  Sentry.setUser(null);
}

export { Sentry };
