// ============================================
// Anchor Daily - Expo App Config (Dynamic)
// ============================================
// This file replaces app.json and allows environment
// variables to be injected at build time via `extra`.
// All secrets are read from process.env (set in .env
// or via EAS Secrets).

import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Anchor Daily',
  slug: 'anchor-daily',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic', // Supports light/dark mode
  scheme: 'anchordaily',           // Deep link URL scheme: anchordaily://
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#F5F0EB',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.anchordaily.app',
    infoPlist: {
      UIBackgroundModes: ['remote-notification'],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#F5F0EB',
    },
    package: 'com.anchordaily.app',
    permissions: ['RECEIVE_BOOT_COMPLETED', 'VIBRATE'],
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'anchordaily',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  plugins: [
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#7C9A8E',
      },
    ],
    ...(process.env.SENTRY_DSN
      ? [
          [
            '@sentry/react-native/expo',
            {
              organization: process.env.SENTRY_ORG || '',
              project: process.env.SENTRY_PROJECT || 'anchor-daily',
              uploadNativeSymbols: false,
              autoUploadProguardMapping: false,
            },
          ] as const,
        ]
      : []),
  ],
  extra: {
    supabaseUrl: process.env.SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'YOUR_ANON_KEY',
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    sentryDsn: process.env.SENTRY_DSN || '',
    sentryOrg: process.env.SENTRY_ORG || '',
    sentryProject: process.env.SENTRY_PROJECT || 'anchor-daily',
    eas: {
      projectId: process.env.EAS_PROJECT_ID || '4f85ed67-e14e-404f-8c55-8a4819588652',
    },
  },
});
