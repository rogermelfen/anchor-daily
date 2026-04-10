// ============================================
// Anchor Daily - Settings / Profile Screen
// ============================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Button } from '../components';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../services/supabase';
import { captureException } from '../services/sentry';
import { FocusArea } from '../types';
import { FOCUS_LABELS } from '../constants/focus';
import Constants from 'expo-constants';
import { Linking } from 'react-native';
import { registerForPushNotifications, cancelDailyReminder, scheduleDailyReminder } from '../services/notifications';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const {
    user,
    isAuthenticated,
    isPremium,
    subscriptionStatus,
    selectedFocus,
    signOut,
    updateUserFocus,
  } = useAppStore();
  const [pushEnabled, setPushEnabled] = useState(user?.push_enabled ?? false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Keep pushEnabled in sync if user object is updated after store rehydration
  useEffect(() => {
    setPushEnabled(user?.push_enabled ?? false);
  }, [user?.push_enabled]);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data (journal entries, profile, preferences). This action cannot be undone.\n\nActive subscriptions must be cancelled separately in the App Store or Google Play.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete My Account',
          style: 'destructive',
          onPress: () => confirmDeleteAccount(),
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Are you absolutely sure?',
      'All your data will be permanently erased. There is no way to recover it.',
      [
        { text: 'Keep My Account', style: 'cancel' },
        {
          text: 'Yes, Delete Everything',
          style: 'destructive',
          onPress: () => executeDeleteAccount(),
        },
      ]
    );
  };

  const executeDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        Alert.alert('Error', 'You must be signed in to delete your account.');
        return;
      }

      const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || '';
      const res = await fetch(`${supabaseUrl}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Deletion failed');
      }

      // Clear local state and navigate to onboarding
      signOut();
      Alert.alert(
        'Account Deleted',
        'Your account and all data have been permanently deleted.',
        [{
          text: 'OK',
          onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] }),
        }]
      );
    } catch (error: any) {
      captureException(error instanceof Error ? error : new Error(String(error)), {
        context: 'delete_account',
      });
      Alert.alert('Error', error.message || 'Could not delete account. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          signOut();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth' }],
          });
        },
      },
    ]);
  };

  const handleChangeFocus = () => {
    Alert.alert('Change Focus', 'Select your new focus area:', [
      {
        text: 'Stress & Anxiety',
        onPress: () => updateUserFocus('stress'),
      },
      {
        text: 'Difficult Decisions',
        onPress: () => updateUserFocus('decisions'),
      },
      {
        text: 'Relationships & Conflict',
        onPress: () => updateUserFocus('relationships'),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleTogglePush = async (value: boolean) => {
    setPushEnabled(value);
    try {
      if (value) {
        const token = await registerForPushNotifications(user?.id);
        if (!token) {
          setPushEnabled(false);
          Alert.alert(
            'Permission Denied',
            'Please enable notifications for Anchor Daily in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }
        await scheduleDailyReminder(8, 0);
        // registerForPushNotifications already writes push_token + push_enabled: true to DB
      } else {
        await cancelDailyReminder();
        if (user) {
          await supabase
            .from('users')
            .update({ push_enabled: false, push_token: null })
            .eq('id', user.id);
        }
      }
    } catch (err) {
      console.warn('Failed to toggle push notifications:', err);
      setPushEnabled(!value);
    }
  };

  const subscriptionLabel = () => {
    switch (subscriptionStatus) {
      case 'trial':
        return 'Free Trial Active';
      case 'active':
        return 'Premium Active';
      case 'expired':
        return 'Subscription Expired';
      default:
        return 'Free Plan';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {isAuthenticated ? (
            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={24} color={COLORS.textOnPrimary} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileEmail}>{user?.email}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{subscriptionLabel()}</Text>
                </View>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.signInCard}
              onPress={() => navigation.navigate('Auth')}
              activeOpacity={0.7}
            >
              <Ionicons name="person-add-outline" size={24} color={COLORS.primary} />
              <View style={styles.signInText}>
                <Text style={styles.signInTitle}>Sign in or create account</Text>
                <Text style={styles.signInSubtitle}>
                  Save your journal, sync across devices, and start your free trial
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Subscription */}
        {!isPremium && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.premiumCard}
              onPress={() => navigation.navigate('Paywall')}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles" size={24} color={COLORS.accent} />
              <View style={{ flex: 1 }}>
                <Text style={styles.premiumCardTitle}>Upgrade to Premium</Text>
                <Text style={styles.premiumCardSubtitle}>
                  Deeper reflections, full history, and more
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <SettingsRow
            icon="compass-outline"
            title="Focus Area"
            value={selectedFocus ? FOCUS_LABELS[selectedFocus] : 'Not set'}
            onPress={handleChangeFocus}
          />

          <View style={styles.settingsRow}>
            <View style={styles.settingsRowLeft}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.settingsRowTitle}>Daily Reminders</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={handleTogglePush}
              trackColor={{ false: COLORS.borderLight, true: COLORS.primaryLight }}
              thumbColor={pushEnabled ? COLORS.primary : COLORS.textMuted}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <SettingsRow
            icon="information-circle-outline"
            title="About Anchor Daily"
            onPress={() =>
              Alert.alert(
                'Anchor Daily',
                'A practical Christian devotional app — one short reflection each morning, grounded in Scripture and designed for real life.\n\nBuilt with care for busy believers.',
                [{ text: 'Close' }]
              )
            }
          />
          <SettingsRow
            icon="document-text-outline"
            title="Privacy Policy"
            onPress={() => Linking.openURL(Constants.expoConfig?.extra?.privacyPolicyUrl || 'https://anchordaily.app/privacy')}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            title="Terms of Service"
            onPress={() => Linking.openURL(Constants.expoConfig?.extra?.termsOfServiceUrl || 'https://anchordaily.app/terms')}
          />
        </View>

        {/* Sign Out & Delete Account */}
        {isAuthenticated && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteAccountButton}
              onPress={handleDeleteAccount}
              disabled={deleteLoading}
            >
              <Text style={styles.deleteAccountText}>
                {deleteLoading ? 'Deleting...' : 'Delete Account & All Data'}
              </Text>
              <Text style={styles.deleteAccountSubtext}>
                Permanently removes your account, journal, and all personal data
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.version}>
          Anchor Daily v{Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper component for settings rows
const SettingsRow: React.FC<{
  icon: string;
  title: string;
  value?: string;
  onPress: () => void;
}> = ({ icon, title, value, onPress }) => (
  <TouchableOpacity style={styles2.row} onPress={onPress} activeOpacity={0.7}>
    <View style={styles2.left}>
      <Ionicons name={icon as any} size={20} color={COLORS.textSecondary} />
      <Text style={styles2.title}>{title}</Text>
    </View>
    <View style={styles2.right}>
      {value && <Text style={styles2.value}>{value}</Text>}
      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
    </View>
  </TouchableOpacity>
);

const styles2 = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.paddingMd,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.paddingSm + 4,
  },
  title: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.paddingSm,
  },
  value: {
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SIZES.paddingXxl,
  },
  header: {
    paddingHorizontal: SIZES.paddingLg,
    paddingTop: SIZES.paddingMd,
    paddingBottom: SIZES.paddingSm,
  },
  title: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  section: {
    paddingHorizontal: SIZES.paddingLg,
    marginTop: SIZES.paddingLg,
  },
  sectionTitle: {
    fontSize: SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SIZES.paddingSm,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingMd,
    ...SHADOWS.small,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.paddingSm + 4,
  },
  profileInfo: {
    flex: 1,
  },
  profileEmail: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight + '30',
    paddingHorizontal: SIZES.paddingSm,
    paddingVertical: 2,
    borderRadius: SIZES.radiusFull,
    marginTop: SIZES.paddingXs,
  },
  statusText: {
    fontSize: SIZES.xs,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  signInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingMd,
    gap: SIZES.paddingSm + 4,
    ...SHADOWS.small,
  },
  signInText: {
    flex: 1,
  },
  signInTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  signInSubtitle: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent + '10',
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingMd,
    gap: SIZES.paddingSm + 4,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
  },
  premiumCardTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  premiumCardSubtitle: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.paddingMd,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.paddingSm + 4,
  },
  settingsRowTitle: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
  },
  signOutButton: {
    alignItems: 'center',
    paddingVertical: SIZES.paddingMd,
  },
  signOutText: {
    fontSize: SIZES.md,
    color: COLORS.error,
    fontWeight: '600',
  },
  deleteAccountButton: {
    alignItems: 'center',
    paddingVertical: SIZES.paddingMd,
    marginTop: SIZES.paddingSm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  deleteAccountText: {
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  deleteAccountSubtext: {
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  version: {
    textAlign: 'center',
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SIZES.paddingLg,
  },
});
