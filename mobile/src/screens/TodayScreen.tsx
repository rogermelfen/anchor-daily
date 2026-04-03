// ============================================
// Anchor Daily - Today / Daily Reflection Screen
// ============================================
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Card, TrialBanner, OfflineBanner } from '../components';
import { useAppStore } from '../store/useAppStore';
import { trackEvent, trackReflectionViewed } from '../services/analytics';

interface TodayScreenProps {
  navigation: any;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({ navigation }) => {
  const {
    todayReflection,
    fetchTodayReflection,
    selectedFocus,
    isPremium,
    isAuthenticated,
  } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showExtended, setShowExtended] = useState(false);

  useEffect(() => {
    fetchTodayReflection();
    trackEvent('app_opened');
  }, []);

  useEffect(() => {
    fetchTodayReflection();
  }, [selectedFocus]);

  useEffect(() => {
    if (todayReflection && selectedFocus) {
      trackReflectionViewed(todayReflection.id, selectedFocus);
    }
  }, [todayReflection?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTodayReflection();
    setRefreshing(false);
  };

  const focusLabels: Record<string, string> = {
    stress: 'Stress & Anxiety',
    decisions: 'Difficult Decisions',
    relationships: 'Relationships & Conflict',
  };

  const focusVerses: Record<string, string> = {
    stress: '"Cast all your anxiety on him." — 1 Pet. 5:7',
    decisions: '"Trust in the Lord with all your heart." — Prov. 3:5',
    relationships: '"Bear with each other and forgive." — Col. 3:13',
  };

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Trial countdown banner */}
        <TrialBanner onPress={() => navigation.navigate('Paywall')} />

        {/* Offline warning */}
        <OfflineBanner />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{dateString}</Text>
          <Text style={styles.greeting}>Today's Devotional</Text>
          {selectedFocus && (
            <View style={styles.focusBadge}>
              <Text style={styles.focusBadgeText}>
                {focusLabels[selectedFocus] || selectedFocus}
              </Text>
            </View>
          )}
        </View>

        {/* Reflection Card */}
        {todayReflection ? (
          <>
            <Card style={styles.reflectionCard}>
              <Text style={styles.reflectionTitle}>{todayReflection.title}</Text>
              <View style={styles.divider} />
              <Text style={styles.reflectionBody}>{todayReflection.short_reflection}</Text>

              {/* Premium extended content */}
              {isPremium && todayReflection.premium_extended_version && (
                <TouchableOpacity
                  onPress={() => setShowExtended(!showExtended)}
                  style={styles.extendedToggle}
                >
                  <Text style={styles.extendedToggleText}>
                    {showExtended ? 'Show less' : 'Read deeper reflection'}
                  </Text>
                  <Ionicons
                    name={showExtended ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              )}
              {showExtended && todayReflection.premium_extended_version && (
                <Text style={styles.extendedBody}>
                  {todayReflection.premium_extended_version}
                </Text>
              )}
            </Card>

            {/* Practical Application */}
            <Card style={styles.applicationCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="bulb-outline" size={20} color={COLORS.accent} />
                <Text style={styles.sectionTitle}>Live It Out Today</Text>
              </View>
              <Text style={styles.applicationBody}>
                {todayReflection.practical_application}
              </Text>
            </Card>

            {/* Question */}
            <Card style={styles.questionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="help-circle-outline" size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Reflect & Pray</Text>
              </View>
              <Text style={styles.questionBody}>{todayReflection.question}</Text>
              <TouchableOpacity
                style={styles.journalPrompt}
                onPress={() => navigation.navigate('Journal')}
              >
                <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                <Text style={styles.journalPromptText}>Write your thoughts and prayers in your journal</Text>
              </TouchableOpacity>
            </Card>

            {/* Premium upsell for free users */}
            {!isPremium && todayReflection.premium_extended_version && (
              <TouchableOpacity
                style={styles.premiumBanner}
                onPress={() => navigation.navigate('Paywall')}
                activeOpacity={0.8}
              >
                <Ionicons name="sparkles" size={20} color={COLORS.accent} />
                <View style={styles.premiumBannerText}>
                  <Text style={styles.premiumTitle}>Go deeper in the Word today</Text>
                  <Text style={styles.premiumSubtitle}>
                    Unlock extended devotionals, full history, and more with Premium
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}

            {/* Sign up prompt for anonymous users */}
            {!isAuthenticated && (
              <TouchableOpacity
                style={styles.signUpBanner}
                onPress={() => navigation.navigate('Auth')}
                activeOpacity={0.8}
              >
                <Ionicons name="person-add-outline" size={20} color={COLORS.primary} />
                <View style={styles.premiumBannerText}>
                  <Text style={styles.premiumTitle}>Save your journey</Text>
                  <Text style={styles.premiumSubtitle}>
                    Create a free account to journal, pray, and track your growth
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="sunny-outline" size={48} color={COLORS.primaryLight} />
            <Text style={styles.emptyTitle}>Your devotional is on its way</Text>
            <Text style={styles.emptySubtitle}>
              Pull down to refresh, or check back soon for today's devotional.
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.paddingLg,
    paddingBottom: SIZES.paddingXxl,
  },
  header: {
    marginBottom: SIZES.paddingMd,
  },
  dateText: {
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  greeting: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SIZES.paddingXs,
  },
  focusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight + '30',
    paddingHorizontal: SIZES.paddingSm + 4,
    paddingVertical: SIZES.paddingXs + 2,
    borderRadius: SIZES.radiusFull,
    marginTop: SIZES.paddingSm,
  },
  focusBadgeText: {
    fontSize: SIZES.xs,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  reflectionCard: {
    marginTop: SIZES.paddingSm,
  },
  reflectionTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.paddingSm,
  },
  divider: {
    height: 2,
    backgroundColor: COLORS.primaryLight + '40',
    borderRadius: 1,
    marginBottom: SIZES.paddingMd,
  },
  reflectionBody: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 26,
  },
  extendedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SIZES.paddingMd,
    paddingTop: SIZES.paddingSm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  extendedToggleText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  extendedBody: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 26,
    marginTop: SIZES.paddingSm,
  },
  applicationCard: {
    backgroundColor: COLORS.accent + '10',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.paddingSm,
    marginBottom: SIZES.paddingSm,
  },
  sectionTitle: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  applicationBody: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 26,
  },
  questionCard: {},
  questionBody: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  journalPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.paddingSm,
    marginTop: SIZES.paddingMd,
    paddingTop: SIZES.paddingSm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  journalPromptText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent + '15',
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingMd,
    marginTop: SIZES.paddingSm,
    gap: SIZES.paddingSm,
  },
  signUpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingMd,
    marginTop: SIZES.paddingSm,
    gap: SIZES.paddingSm,
  },
  premiumBannerText: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  premiumSubtitle: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: SIZES.paddingXxl,
    marginTop: SIZES.paddingXl,
  },
  emptyTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SIZES.paddingMd,
  },
  emptySubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.paddingSm,
    lineHeight: 20,
  },
});
