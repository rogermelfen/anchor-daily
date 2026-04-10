// ============================================
// Practical Christian Daily - Choose Focus Screen
// ============================================
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../constants/theme';
import { Button, FocusSelector } from '../components';
import { FocusArea } from '../types';
import { useAppStore } from '../store/useAppStore';
import { trackThemeSelected, trackEvent } from '../services/analytics';

interface ChooseFocusScreenProps {
  navigation: any;
}

export const ChooseFocusScreen: React.FC<ChooseFocusScreenProps> = ({ navigation }) => {
  const [localFocus, setLocalFocus] = useState<FocusArea | null>(null);
  const [continuing, setContinuing] = useState(false);
  const { setSelectedFocus, setOnboardingComplete, updateUserFocus, isAuthenticated } =
    useAppStore();

  const handleContinue = async () => {
    if (!localFocus || continuing) return;

    setContinuing(true);
    try {
      setSelectedFocus(localFocus);
      setOnboardingComplete(true);
      trackThemeSelected(localFocus);
      trackEvent('onboarding_completed');

      if (isAuthenticated) {
        await updateUserFocus(localFocus);
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        navigation.navigate('Auth');
      }
    } finally {
      setContinuing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Where do you need{'\n'}God's wisdom most?</Text>
        <Text style={styles.subtitle}>
          Your daily devotional will be tailored to your current season of life. You can change
          this anytime.
        </Text>
        <FocusSelector selected={localFocus} onSelect={setLocalFocus} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={continuing ? 'Loading...' : 'Continue'}
          onPress={handleContinue}
          size="large"
          disabled={!localFocus || continuing}
          loading={continuing}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SIZES.paddingLg,
    paddingTop: SIZES.paddingXl,
    paddingBottom: SIZES.paddingMd,
  },
  title: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.paddingSm,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SIZES.paddingXl,
  },
  footer: {
    paddingHorizontal: SIZES.paddingLg,
    paddingBottom: SIZES.paddingXl,
  },
  button: {
    width: '100%',
  },
});
