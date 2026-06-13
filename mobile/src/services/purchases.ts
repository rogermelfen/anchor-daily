import * as Linking from 'expo-linking';
import { supabase } from './supabase';
import { SubscriptionStatus } from '../types';

export async function initializePurchases(_userId?: string) {}

export async function openCheckout(plan: 'monthly' | 'yearly', userId: string): Promise<boolean> {
  try {
    const returnUrl = 'anchordaily://payment-success';
    const cancelUrl = 'anchordaily://payment-cancelled';

    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
      body: { plan, userId, returnUrl, cancelUrl },
    });

    if (error || !data?.url) {
      console.error('Error creating checkout session:', error);
      return false;
    }

    await Linking.openURL(data.url);
    return true;
  } catch (error) {
    console.error('Error opening checkout:', error);
    return false;
  }
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'none';

    const { data } = await supabase
      .from('users')
      .select('subscription_status, trial_end_date')
      .eq('id', user.id)
      .single();

    if (!data) return 'none';

    if (data.subscription_status === 'trial') {
      const trialEnd = data.trial_end_date ? new Date(data.trial_end_date) : null;
      if (trialEnd && trialEnd > new Date()) return 'trial';
      return 'expired';
    }

    return (data.subscription_status as SubscriptionStatus) || 'none';
  } catch {
    return 'none';
  }
}
