// ============================================
// Anchor Daily - Main App Entry Point
// ============================================
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { supabase } from './src/services/supabase';
import { useAppStore } from './src/store/useAppStore';
import { initializePurchases, getSubscriptionStatus } from './src/services/purchases';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { LoadingScreen } from './src/components/LoadingScreen';
import { initSentry, captureException, setUser as setSentryUser } from './src/services/sentry';
import { startSyncListener, syncPendingEntries } from './src/services/offlineSync';
import { useTheme } from './src/constants/theme';

// Initialize Sentry as early as possible
initSentry();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const { setUser, setLoading, setSubscriptionStatus } = useAppStore();

  useEffect(() => {
    initializeApp();

    // Start offline journal sync listener
    const unsubscribeSync = startSyncListener();
    // Also sync any pending entries from previous sessions
    syncPendingEntries().catch(console.error);

    return () => {
      unsubscribeSync();
    };
  }, []);

  const { isDark } = useTheme();

  const initializeApp = async () => {
    try {
      // Check for existing auth session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

          if (profile) {
            setUser(profile);
            setSentryUser(session.user.id, session.user.email || undefined);
          }

          // Initialize RevenueCat with user ID
        await initializePurchases(session.user.id);

        // Check subscription status
        const status = await getSubscriptionStatus();
        setSubscriptionStatus(status);
      } else {
        // Initialize RevenueCat anonymously
        await initializePurchases();
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser(profile);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });
    } catch (error: any) {
      console.error('Error initializing app:', error);
      captureException(error instanceof Error ? error : new Error(String(error)), {
        context: 'app_initialization',
      });
      // App will still launch — persisted state and fallback content
      // ensure the user always sees something.
    } finally {
      setLoading(false);
      setIsReady(true);
    }
  };

  if (!isReady) {
    return <LoadingScreen message="Preparing your reflection..." />;
  }

  return (
    <ErrorBoundary fallbackMessage="Something unexpected happened. Tap below to restart the app.">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </ErrorBoundary>
  );
}
