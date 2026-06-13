import React, { useState } from 'react';
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
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Button } from '../components';
import { useAppStore } from '../store/useAppStore';
import { trackPaywallViewed, trackEvent } from '../services/analytics';
import { openCheckout, getSubscriptionStatus } from '../services/purchases';

interface PaywallScreenProps {
  navigation: any;
}

type PlanType = 'yearly' | 'monthly';

export const PaywallScreen: React.FC<PaywallScreenProps> = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const { isAuthenticated, user, setSubscriptionStatus } = useAppStore();

  React.useEffect(() => {
    trackPaywallViewed('paywall_screen');
  }, []);

  const handleSubscribe = async () => {
    if (!isAuthenticated || !user) {
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

    setLoading(true);
    try {
      const opened = await openCheckout(selectedPlan, user.id);
      if (!opened) {
        Alert.alert('Not Available', 'Could not open payment page. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const status = await getSubscriptionStatus();
      if (status === 'active' || status === 'trial') {
        setSubscriptionStatus(status);
        trackEvent('subscription_verified', { status });
        Alert.alert(
          'Subscription Active',
          'Your subscription is confirmed.',
          [{ text: 'Get Started', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          'No Active Subscription',
          'No active subscription found. Complete payment to continue.'
        );
      }
    } catch {
      Alert.alert('Error', 'Could not check subscription status. Please try again.');
    } finally {
      setChecking(false);
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
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={COLORS.textSecondary} />
        </TouchableOpacity>

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
                <Text style={styles.planPrice}>$39.99 / year</Text>
                <Text style={styles.planSubprice}>Just $3.33 / month</Text>
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
                <Text style={styles.planPrice}>$5.99 / month</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <Button
          title="Start 14-Day Free Trial"
          onPress={handleSubscribe}
          loading={loading}
          size="large"
          style={styles.ctaButton}
        />
        <Text style={styles.disclaimer}>
          Cancel anytime. You won't be charged until your 14-day trial ends.
        </Text>

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleCheckStatus}
          disabled={checking}
        >
          <Text style={styles.restoreText}>
            {checking ? 'Checking...' : 'Already subscribed? Tap to verify'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SIZES.paddingLg, paddingBottom: SIZES.paddingXxl },
  closeButton: { alignSelf: 'flex-end', padding: SIZES.paddingSm },
  header: { alignItems: 'center', marginBottom: SIZES.paddingXl },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.accent + '15',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SIZES.paddingMd,
  },
  title: {
    fontSize: SIZES.xxl + 2, fontWeight: '700', color: COLORS.textPrimary,
    textAlign: 'center', lineHeight: 38,
  },
  subtitle: {
    fontSize: SIZES.md, color: COLORS.textSecondary, textAlign: 'center',
    lineHeight: 24, marginTop: SIZES.paddingSm, paddingHorizontal: SIZES.paddingSm,
  },
  features: { gap: SIZES.paddingMd, marginBottom: SIZES.paddingXl },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SIZES.paddingSm + 4 },
  featureIcon: {
    width: 40, height: 40, borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center', justifyContent: 'center',
  },
  featureText: { flex: 1 },
  featureTitle: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.textPrimary },
  featureDescription: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 2, lineHeight: 20 },
  plans: { gap: SIZES.paddingSm + 4, marginBottom: SIZES.paddingLg },
  planCard: {
    backgroundColor: COLORS.surface, borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingMd + 4, borderWidth: 2, borderColor: 'transparent',
    ...SHADOWS.small,
  },
  planCardSelected: { borderColor: COLORS.primary },
  planHeader: { flexDirection: 'row', alignItems: 'center' },
  planRadio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    marginRight: SIZES.paddingSm + 4,
  },
  planRadioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },
  planInfo: { flex: 1 },
  planTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.paddingSm },
  planTitle: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
  bestValueBadge: {
    backgroundColor: COLORS.accent, paddingHorizontal: SIZES.paddingSm,
    paddingVertical: 2, borderRadius: SIZES.radiusFull,
  },
  bestValueText: { fontSize: 10, fontWeight: '700', color: COLORS.textOnPrimary },
  planPrice: { fontSize: SIZES.sm + 1, fontWeight: '600', color: COLORS.textPrimary, marginTop: 2 },
  planSubprice: { fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 1 },
  ctaButton: { marginBottom: SIZES.paddingSm },
  disclaimer: {
    fontSize: SIZES.xs, color: COLORS.textMuted, textAlign: 'center',
    lineHeight: 18, paddingHorizontal: SIZES.paddingSm,
  },
  restoreButton: { alignItems: 'center', marginTop: SIZES.paddingMd, paddingVertical: SIZES.paddingSm },
  restoreText: { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: '500' },
});
