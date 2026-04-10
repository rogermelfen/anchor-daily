// ============================================
// Anchor Daily - RevenueCat Subscription Service
// ============================================
// Reads API keys from app.config.ts -> extra,
// which in turn reads from environment variables.
// No hardcoded secrets in source code.

import Purchases, {
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { SubscriptionStatus } from '../types';

const extra = Constants.expoConfig?.extra ?? {};

const REVENUECAT_IOS_KEY: string = extra.revenuecatIosKey || '';
const REVENUECAT_ANDROID_KEY: string = extra.revenuecatAndroidKey || '';

let isRevenueCatConfigured = false;

/**
 * Initialize RevenueCat SDK.
 * Call this once on app startup.
 */
export async function initializePurchases(userId?: string) {
  try {
    const apiKey =
      Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;

    if (!apiKey) {
      console.warn(
        '[Anchor Daily] RevenueCat API key is not configured. ' +
        'Set REVENUECAT_IOS_API_KEY / REVENUECAT_ANDROID_API_KEY in .env or EAS Secrets.'
      );
      return;
    }

    Purchases.configure({ apiKey });
    isRevenueCatConfigured = true;

    if (userId) {
      await Purchases.logIn(userId);
    }
  } catch (error) {
    console.error('Error initializing RevenueCat:', error);
  }
}

/**
 * Get available subscription packages.
 */
export async function getOfferings(): Promise<PurchasesPackage[]> {
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current && offerings.current.availablePackages) {
      return offerings.current.availablePackages;
    }
    return [];
  } catch (error) {
    console.error('Error fetching offerings:', error);
    return [];
  }
}

/**
 * Purchase a subscription package.
 */
export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<CustomerInfo | null> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  } catch (error: any) {
    if (!error.userCancelled) {
      console.error('Error purchasing package:', error);
    }
    return null;
  }
}

/**
 * Restore previous purchases.
 */
export async function restorePurchases(): Promise<CustomerInfo | null> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    return null;
  }
}

/**
 * Check current subscription status.
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  if (!isRevenueCatConfigured) return 'none';
  try {
    const customerInfo = await Purchases.getCustomerInfo();

    // Check for active "premium" entitlement
    if (customerInfo.entitlements.active['premium']) {
      const entitlement = customerInfo.entitlements.active['premium'];

      // Check if it's a trial period
      if (entitlement.periodType === 'TRIAL') {
        return 'trial';
      }

      return 'active';
    }

    return 'none';
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return 'none';
  }
}
