// ============================================
// Anchor Daily - Onboarding / Welcome Screen
// ============================================
import React from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { Button } from '../components';

interface OnboardingScreenProps {
  navigation: any;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / Icon Area */}
        <View style={styles.iconArea}>
          <View style={styles.iconCircle}>
            <Ionicons name="book-outline" size={48} color={COLORS.primary} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Faith for your{'\n'}everyday life.</Text>

        {/* Description */}
        <Text style={styles.description}>
          One short, practical Christian devotional each morning — grounded in Scripture and
          designed for the real challenges you face today.
        </Text>

        {/* Value props */}
        <View style={styles.valueProps}>
          <ValueProp
            icon="time-outline"
            text="A 2-minute devotional that fits your morning routine"
          />
          <ValueProp
            icon="book-outline"
            text="Scripture-based wisdom for stress, decisions, and relationships"
          />
          <ValueProp
            icon="journal-outline"
            text="A private journal to pray, reflect, and grow"
          />
        </View>

        {/* CTA */}
        <Button
          title="Get Started"
          onPress={() => navigation.navigate('ChooseFocus')}
          size="large"
          style={styles.button}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const ValueProp: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <View style={styles.valuePropRow}>
    <Ionicons name={icon as any} size={20} color={COLORS.primary} />
    <Text style={styles.valuePropText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.paddingLg,
    paddingTop: SIZES.paddingLg,
    paddingBottom: SIZES.paddingXl,
    justifyContent: 'center',
  },
  iconArea: {
    alignItems: 'center',
    marginBottom: SIZES.paddingLg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: SIZES.paddingSm,
  },
  description: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SIZES.paddingLg,
    paddingHorizontal: SIZES.paddingMd,
  },
  valueProps: {
    gap: SIZES.paddingSm,
    paddingHorizontal: SIZES.paddingSm,
    marginBottom: SIZES.paddingLg,
  },
  valuePropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.paddingSm + 4,
  },
  valuePropText: {
    fontSize: SIZES.sm + 1,
    color: COLORS.textPrimary,
    flex: 1,
  },
  button: {
    width: '100%',
  },
});
