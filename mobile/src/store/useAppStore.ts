// ============================================
// Anchor Daily - Global State Store (Zustand)
// ============================================
// Uses zustand/middleware persist with AsyncStorage
// so onboarding state and focus selection survive restarts.
// Falls back to bundled content when Supabase is unreachable.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, FocusArea, Reflection, JournalEntry, SubscriptionStatus } from '../types';

// RFC 4122-compliant UUID v4 generator (no external dependency required)
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
import { supabase } from '../services/supabase';
import { getFallbackReflection } from '../constants/fallbackContent';
import { saveJournalOffline } from '../services/offlineSync';

interface AppStore {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Onboarding (persisted)
  hasCompletedOnboarding: boolean;
  selectedFocus: FocusArea | null;

  // Subscription
  subscriptionStatus: SubscriptionStatus;
  isPremium: boolean;

  // Content
  todayReflection: Reflection | null;
  journalEntries: JournalEntry[];
  reflectionHistory: Reflection[];

  // Theme
  themeMode: 'light' | 'dark' | 'system';

  // Error state
  lastError: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setSelectedFocus: (focus: FocusArea) => void;
  setSubscriptionStatus: (status: SubscriptionStatus) => void;
  setTodayReflection: (reflection: Reflection | null) => void;
  setJournalEntries: (entries: JournalEntry[]) => void;
  addJournalEntry: (entry: JournalEntry) => void;
  setReflectionHistory: (reflections: Reflection[]) => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  clearError: () => void;
  signOut: () => void;

  // Async actions
  fetchTodayReflection: () => Promise<void>;
  fetchJournalEntries: () => Promise<void>;
  fetchReflectionHistory: () => Promise<void>;
  saveJournalEntry: (content: string, reflectionId?: string) => Promise<JournalEntry | null>;
  updateUserFocus: (focus: FocusArea) => Promise<void>;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true,
      hasCompletedOnboarding: false,
      selectedFocus: null,
      subscriptionStatus: 'none',
      isPremium: false,
      todayReflection: null,
      journalEntries: [],
      reflectionHistory: [],
      themeMode: 'system' as const,
      lastError: null,

      // Setters
      setThemeMode: (themeMode) => set({ themeMode }),

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isPremium: user?.is_premium ?? false,
          selectedFocus: user?.selected_focus ?? get().selectedFocus,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setOnboardingComplete: (hasCompletedOnboarding) => set({ hasCompletedOnboarding }),

      setSelectedFocus: (selectedFocus) => set({ selectedFocus }),

      setSubscriptionStatus: (subscriptionStatus) =>
        set({
          subscriptionStatus,
          isPremium: subscriptionStatus === 'active' || subscriptionStatus === 'trial',
        }),

      setTodayReflection: (todayReflection) => set({ todayReflection }),

      setJournalEntries: (journalEntries) => set({ journalEntries }),

      addJournalEntry: (entry) =>
        set((state) => ({ journalEntries: [entry, ...state.journalEntries] })),

      setReflectionHistory: (reflectionHistory) => set({ reflectionHistory }),

      clearError: () => set({ lastError: null }),

      signOut: () =>
        set({
          user: null,
          isAuthenticated: false,
          isPremium: false,
          subscriptionStatus: 'none',
          journalEntries: [],
          reflectionHistory: [],
          // Keep onboarding and focus persisted
        }),

      // ============================================
      // Async: Fetch today's reflection (with fallback)
      // ============================================
      fetchTodayReflection: async () => {
        const { selectedFocus } = get();
        if (!selectedFocus) return;

        try {
          const today = new Date().toISOString().split('T')[0];

          const { data, error } = await supabase
            .from('reflections')
            .select('*')
            .eq('theme', selectedFocus)
            .eq('status', 'published')
            .lte('publish_date', today)
            .order('publish_date', { ascending: false })
            .limit(1)
            .single();

          if (data && !error) {
            set({ todayReflection: data as Reflection, lastError: null });
          } else {
            // Supabase returned no data — use fallback
            console.log('No data from Supabase, using fallback content');
            set({ todayReflection: getFallbackReflection(selectedFocus), lastError: null });
          }
        } catch (err) {
          // Network error — use fallback
          console.warn('Network error fetching reflection, using fallback:', err);
          const { selectedFocus: focus } = get();
          if (focus) {
            set({
              todayReflection: getFallbackReflection(focus),
              lastError: 'Could not connect to server. Showing offline content.',
            });
          }
        }
      },

      // ============================================
      // Async: Fetch journal entries (graceful fail)
      // ============================================
      fetchJournalEntries: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (data && !error) {
            set({ journalEntries: data as JournalEntry[] });
          }
        } catch (err) {
          console.warn('Failed to fetch journal entries:', err);
          set({ lastError: 'Could not load journal entries. Check your connection.' });
        }
      },

      // ============================================
      // Async: Fetch reflection history (graceful fail)
      // ============================================
      fetchReflectionHistory: async () => {
        const { selectedFocus } = get();
        if (!selectedFocus) return;

        try {
          const today = new Date().toISOString().split('T')[0];

          const { data, error } = await supabase
            .from('reflections')
            .select('*')
            .eq('theme', selectedFocus)
            .eq('status', 'published')
            .lte('publish_date', today)
            .order('publish_date', { ascending: false })
            .limit(30);

          if (data && !error) {
            set({ reflectionHistory: data as Reflection[] });
          }
        } catch (err) {
          console.warn('Failed to fetch history:', err);
          set({ lastError: 'Could not load history. Check your connection.' });
        }
      },

      // ============================================
      // Async: Save a journal entry
      // ============================================
      saveJournalEntry: async (content, reflectionId) => {
        const { user } = get();
        if (!user) return null;

        // Generate a valid UUID for optimistic update (must pass Supabase UUID check on offline sync)
        const localId = generateUUID();
        const now = new Date().toISOString();

        // Optimistic local entry
        const optimisticEntry: JournalEntry = {
          id: localId,
          user_id: user.id,
          reflection_id: reflectionId || null,
          content,
          created_at: now,
        } as JournalEntry;

        // Add to local state immediately (instant feedback)
        get().addJournalEntry(optimisticEntry);

        try {
          const { data, error } = await supabase
            .from('journal_entries')
            .insert({
              user_id: user.id,
              reflection_id: reflectionId || null,
              content,
            })
            .select()
            .single();

          if (data && !error) {
            // Replace optimistic entry with server entry
            const serverEntry = data as JournalEntry;
            set((state) => ({
              journalEntries: state.journalEntries.map((e) =>
                e.id === localId ? serverEntry : e
              ),
            }));
            return serverEntry;
          }
          throw new Error('Insert failed');
        } catch (err) {
          console.warn('Failed to save journal entry online, saving offline:', err);
          // Save to offline queue for later sync
          await saveJournalOffline({
            id: localId,
            user_id: user.id,
            reflection_id: reflectionId,
            content,
            created_at: now,
          });
          // Entry is already in local state — user sees it immediately
          return optimisticEntry;
        }
      },

      // ============================================
      // Async: Update user focus area
      // ============================================
      updateUserFocus: async (focus) => {
        const { user } = get();
        set({ selectedFocus: focus });

        if (user) {
          try {
            await supabase
              .from('users')
              .update({ selected_focus: focus })
              .eq('id', user.id);
          } catch (err) {
            console.warn('Failed to update focus on server:', err);
            // Focus is already set locally via persist, so the user isn't blocked
          }
        }
      },
    }),
    {
      name: 'anchor-daily-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist these fields across app restarts:
      partialize: (state: AppStore) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        selectedFocus: state.selectedFocus,
        themeMode: state.themeMode,
      }),
    }
  )
);
