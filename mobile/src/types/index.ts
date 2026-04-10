// ============================================
// Anchor Daily - Type Definitions
// ============================================

export interface User {
  id: string;
  email: string;
  created_at: string;
  selected_focus: FocusArea | null;
  is_premium: boolean;
  trial_start_date: string | null;
  trial_end_date: string | null;
  subscription_status: string | null;
  push_enabled: boolean;
  push_token: string | null;
}

export type FocusArea = 'stress' | 'decisions' | 'relationships';

export interface Reflection {
  id: string;
  title: string;
  theme: FocusArea;
  short_reflection: string;
  practical_application: string;
  question: string;
  premium_extended_version: string | null;
  tags: string[];
  status: 'draft' | 'published';
  publish_date: string;
  is_premium_only: boolean;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  reflection_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export type SubscriptionStatus = 'none' | 'trial' | 'active' | 'expired';

export interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Onboarding
  hasCompletedOnboarding: boolean;
  selectedFocus: FocusArea | null;

  // Subscription
  subscriptionStatus: SubscriptionStatus;
  isPremium: boolean;

  // Content
  todayReflection: Reflection | null;
  journalEntries: JournalEntry[];
}

// Navigation types
export type RootStackParamList = {
  Onboarding: undefined;
  ChooseFocus: undefined;
  MainTabs: undefined;
  Auth: undefined;
  Paywall: undefined;
  ReflectionDetail: { reflectionId: string };
  Reflect: undefined;
};

export type MainTabParamList = {
  Today: undefined;
  Journal: undefined;
  History: undefined;
  Settings: undefined;
};
