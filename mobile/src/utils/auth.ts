// ============================================
// Anchor Daily - Auth Utility Functions
// ============================================
import { supabase } from '../services/supabase';
import { User } from '../types';

/**
 * Check if there is an active session and return the user profile.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) return null;

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) return null;

    return profile as User;
  } catch {
    return null;
  }
}

/**
 * Check if the user's trial is still active.
 * Returns true if within the 14-day trial window.
 */
export function isTrialActive(trialStartDate: string | null): boolean {
  if (!trialStartDate) return false;

  const start = new Date(trialStartDate);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  return diffDays <= 14;
}

/**
 * Get the number of trial days remaining.
 */
export function getTrialDaysRemaining(trialStartDate: string | null): number {
  if (!trialStartDate) return 0;

  const start = new Date(trialStartDate);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  return Math.max(0, 14 - diffDays);
}

/**
 * Sign up a new user with email and password.
 * Creates the auth user and the public profile.
 */
export async function signUp(
  email: string,
  password: string,
  selectedFocus?: string
): Promise<{ user: User | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: 'Sign up failed' };

    // Create public profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email,
        selected_focus: selectedFocus || null,
        is_premium: false,
        trial_start_date: new Date().toISOString(),
        trial_end_date: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
        subscription_status: 'trial',
      })
      .select()
      .single();

    if (profileError) {
      return { user: null, error: profileError.message };
    }

    return { user: profile as User, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Unknown error' };
  }
}

/**
 * Sign in an existing user.
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: 'Sign in failed' };

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return { user: (profile as User) || null, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Unknown error' };
  }
}

/**
 * Sign out the current user.
 */
export async function signOutUser(): Promise<void> {
  await supabase.auth.signOut();
}
