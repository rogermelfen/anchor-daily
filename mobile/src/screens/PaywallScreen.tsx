// ============================================
// Anchor Daily - Paywall / Subscription Screen
// ============================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PurchasesPackage } from 'react-native-purchases';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Button } from '../components';
import { useAppStore } from '../store/useAppStore';
import { trackPaywallViewed, trackEvent } from '../services/analytics';
import { getOfferings, purchasePackage, restorePurchases } from '../services/purchases';

interface PaywallScreenProps {
  navigation: any;
}

type PlanType = 'yearly' | 'monthly';

export const PaywallScreen: React.FC<PaywallScreenProps> = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const { isAuthenticated, setSubscriptionStatus } = useAppStore();

  useEffect(() => {
    trackPaywallViewed('paywall_screen');
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      const available = await getOfferings();
      setPackages(available);
    } catch {
      // No offerings available — RevenueCat not configured yet
    }
  };

  const getPackageForPlan = (plan: PlanType): PurchasesPackage | null => {
    if (packages.length === 0) return null;
    return packages.find((pkg) =>
      plan === 'yearly'
        ? pkg.packageType === 'ANNUAL' || pkg.identifier.toLowerCase().includes('annual') || pkg.identifier.toLowerCase().includes('year')
        : pkg.packageType === 'MONTHLY' || pkg.identifier.toLowerCase().includes('month')
    ) ?? packages[0] ?? null;
  };

  // Derive displayed prices from RevenueCat when available; fall back to defaults
  const yearlyPkg = getPackageForPlan('yearly');
  const monthlyPkg = getPackageForPlan('monthly');
  const yearlyPrice = yearlyPkg?.product?.priceString ?? '$39.99 / year';
  const monthlyPrice = monthlyPkg?.product?.priceString ?? '$5.99 / month';
  const yearlyMonthly = yearlyPkg
    ? `Just ${(yearlyPkg.product.price / 12).toLocaleString('en-US', {
        style: 'currency',
        currency: yearlyPkg.product.currencyCode ?? 'USD',
        maximumFractionDigits: 2,
      })} / month`
    : 'Just $3.33 / month';
  // CTA label: show "Subscribe" instead of "Start Trial" if packages are loaded
  // (RevenueCat controls trial eligibility — we shouldn't claim a trial if RC says otherwise)
  const ctaLabel = packages.length === 0 ? 'Start 14-Day Free Trial' : 'Subscribe Now';

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Account Required',
        'Please create a free account first to start your trial.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create Account', onPress: () => navigation.navigate('Auth') },
        ]
      );
      return;
    }

    const pkg = getPackageForPlan(selectedPlan);
    if (!pkg) {
      Alert.alert(
        'Not Available',
        'Subscriptions are not available yet. Please try again later.'
      );
      return;
    }

    setLoading(true);
    try {
      const customerInfo = await purchasePackage(pkg);
      if (customerInfo) {
        // If RevenueCat returns customerInfo without throwing, the purchase succeeded.
        // We set 'active' regardless of entitlement key name — a misconfigured entitlement
        // key in the RC dashboard should not override a confirmed successful purchase.
        if (!customerInfo.entitlements.active['premium']) {
          console.warn('[Paywall] Purchase succeeded but "premium" entitlement not found. Check RevenueCat dashboard entitlement ID.');
        }
        setSubscriptionStatus('active');
        trackEvent('subscription_purchased', { plan: selectedPlan });
        Alert.alert(
          'Welcome to Premium!',
          'Your subscription is now active. Enjoy full access to Anchor Daily.',
          [{ text: 'Get Started', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error: any) {
      if (!error?.userCancelled) {
        Alert.alert('Purchase Failed', 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const customerInfo = await restorePurchases();
      if (customerInfo && customerInfo.entitlements.active['premium']) {
        setSubscriptionStatus('active');
        trackEvent('subscription_restored');
        Alert.alert(
          'Purchase Restored',
          'Your subscription has been restored successfully.',
          [{ text: 'Continue', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          'No Purchase Found',
          'We could not find a previous purchase for this account.'
        );
      }
    } catch {
      Alert.alert('Restore Failed', 'Could not restore purchases. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  const features = [
    {
      icon: 'book-outline',
      title: 'Extended Devotionals',
      description: 'Deeper Scripture study and reflection when you need to go further',
    },
    {
      icon: 'layers-outline',
      title: 'Full 90-Day Library',
      description: 'Access all devotionals across all three focus areas, anytime',
    },
    {
      icon: 'time-outline',
      title: 'Full History & Journal',
      description: 'Revisit past devotionals and all your journal entries and prayers',
    },
    {
      icon: 'heart-outline',
      title: 'Personalized to Your Season',
      description: 'Content tailored to where you are in your faith journey right now',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="sparkles" size={32} color={COLORS.accent} />
          </View>
          <Text style={styles.title}>Deepen Your{'\n'}Daily Walk with God</Text>
          <Text style={styles.subtitle}>
            Unlock the full library of Scripture-based devotionals, extended reflections, and
            your complete prayer journal — all in one quiet place.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon as any} size={20} color={COLORS.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Plan Selection */}
        <View style={styles.plans}>
          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardSelected]}
            onPress={() => setSelectedPlan('yearly')}
            activeOpacity={0.7}
          >
            <View style={styles.planHeader}>
              <View style={styles.planRadio}>
                {selectedPlan === 'yearly' && <View style={styles.planRadioInner} />}
              </View>
              <View style={styles.planInfo}>
                <View style={styles.planTitleRow}>
                  <Text style={styles.planTitle}>Yearly</Text>
                  <View style={styles.bestValueBadge}>
                    <Text style={styles.bestValueText}>Best Value</Text>
                  </View>
                </View>
                <Text style={styles.planPrice}>{yearlyPrice}</Text>
                <Text style={styles.planSubprice}>{yearlyMonthly}</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]}
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.7}
          >
            <View style={styles.planHeader}>
              <View style={styles.planRadio}>
                {selectedPlan === 'monthly' && <View style={styles.planRadioInner} />}
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>Monthly</Text>
                <Text style={styles.planPrice}>{monthlyPrice}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <Button
          title={ctaLabel}
          onPress={handleSubscribe}
          loading={loading}
          size="large"
          style={styles.ctaButton}
        />
        <Text style={styles.disclaimer}>
          Cancel anytime. You won't be charged until your 14-day trial ends. Payment will be
          charged to your App Store or Google Play account.
        </Text>

        {/* Restore */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={restoring}
        >
          <Text style={styles.restoreText}>
            {restoring ? 'Restoring...' : 'Restore Purchase'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.paddingLg,
    paddingBottom: SIZES.paddingXxl,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: SIZES.paddingSm,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.paddingXl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.paddingMd,
  },
  title: {
    fontSize: SIZES.xxl + 2,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 38,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: SIZES.paddingSm,
    paddingHorizontal: SIZES.paddingSm,
  },
  features: {
    gap: SIZES.paddingMd,
    marginBottom: SIZES.paddingXl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.paddingSm + 4,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  featureDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 20,
  },
  plans: {
    gap: SIZES.paddingSm + 4,
    marginBottom: SIZES.paddingLg,
  },
  planCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingMd + 4,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.small,
  },
  planCardSelected: {
    borderColor: COLORS.primary,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.paddingSm + 4,
  },
  planRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  planInfo: {
    flex: 1,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.paddingSm,
  },
  planTitle: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  bestValueBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SIZES.paddingSm,
    paddingVertical: 2,
    borderRadius: SIZES.radiusFull,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textOnPrimary,
  },
  planPrice: {
    fontSize: SIZES.sm + 1,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  planSubprice: {
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  ctaButton: {
    marginBottom: SIZES.paddingSm,
  },
  disclaimer: {
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: SIZES.paddingSm,
  },
  restoreButton: {
    alignItems: 'center',
    marginTop: SIZES.paddingMd,
    paddingVertical: SIZES.paddingSm,
  },
  restoreText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
});
