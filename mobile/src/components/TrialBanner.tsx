// ============================================
// Anchor Daily - Trial Countdown Banner
// ============================================
// Shows "X days left of your free trial" when the user
// is in trial status. Tapping it navigates to the paywall.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';

interface TrialBannerProps {
  onPress?: () => void;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ onPress }) => {
  const user = useAppStore((s) => s.user);
  const subscriptionStatus = useAppStore((s) => s.subscriptionStatus);

  // Only show for trial users
  if (subscriptionStatus !== 'trial' || !user?.trial_end_date) {
    return null;
  }

  const now = new Date();
  const trialEnd = new Date(user.trial_end_date);
  const diffMs = trialEnd.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  // Trial expired
  if (daysLeft <= 0) {
    return (
      <TouchableOpacity style={[styles.banner, styles.expiredBanner]} onPress={onPress}>
        <Ionicons name="time-outline" size={16} color="#c0392b" />
        <Text style={[styles.text, styles.expiredText]}>
          Your free trial has ended. Tap to subscribe and keep full access.
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#c0392b" />
      </TouchableOpacity>
    );
  }

  // Last 3 days — urgent styling
  if (daysLeft <= 3) {
    return (
      <TouchableOpacity style={[styles.banner, styles.urgentBanner]} onPress={onPress}>
        <Ionicons name="hourglass-outline" size={16} color="#e67e22" />
        <Text style={[styles.text, styles.urgentText]}>
          {daysLeft === 1
            ? 'Last day of your free trial!'
            : `${daysLeft} days left of your free trial`}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#e67e22" />
      </TouchableOpacity>
    );
  }

  // Normal trial
  return (
    <TouchableOpacity style={styles.banner} onPress={onPress}>
      <Ionicons name="gift-outline" size={16} color={COLORS.primary} />
      <Text style={styles.text}>
        {daysLeft} days left of your free trial
      </Text>
      <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '12',
    paddingVertical: SIZES.paddingSm,
    paddingHorizontal: SIZES.paddingMd,
    marginHorizontal: SIZES.paddingMd,
    marginBottom: SIZES.paddingSm,
    borderRadius: 10,
    gap: SIZES.paddingSm,
  },
  urgentBanner: {
    backgroundColor: '#FFF3CD',
  },
  expiredBanner: {
    backgroundColor: '#FDECEA',
  },
  text: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  urgentText: {
    color: '#e67e22',
  },
  expiredText: {
    color: '#c0392b',
  },
});
