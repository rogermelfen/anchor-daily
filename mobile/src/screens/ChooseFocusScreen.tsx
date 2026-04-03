// ============================================
// Practical Christian Daily - Choose Focus Screen
// ============================================
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
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
  const { setSelectedFocus, setOnboardingComplete, updateUserFocus, isAuthenticated } =
    useAppStore();

  const handleContinue = async () => {
    if (!localFocus) return;

    setSelectedFocus(localFocus);
    setOnboardingComplete(true);
    trackThemeSelected(localFocus);
    trackEvent('onboarding_completed');

    if (isAuthenticated) {
      await updateUserFocus(localFocus);
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Where do you need{'\n'}God's wisdom most?</Text>
        <Text style={styles.subtitle}>
          Your daily devotional will be tailored to your current season of life. You can change
          this anytime.
        </Text>

        <View style={styles.selectorContainer}>
          <FocusSelector selected={localFocus} onSelect={setLocalFocus} />
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          size="large"
          disabled={!localFocus}
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
  content: {
    flex: 1,
    paddingHorizontal: SIZES.paddingLg,
    paddingTop: SIZES.paddingXxl,
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
  selectorContainer: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: SIZES.paddingLg,
    paddingBottom: SIZES.paddingXl,
  },
  button: {
    width: '100%',
  },
});
