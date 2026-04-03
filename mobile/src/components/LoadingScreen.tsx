// ============================================
// Anchor Daily - Loading Screen
// ============================================
// Shown while the app is initializing (checking auth,
// loading persisted state, fetching first content).

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Preparing your reflection...',
}) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.circle, { opacity: pulseAnim }]} />
      <Text style={styles.appName}>Anchor Daily</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    marginBottom: SIZES.paddingLg,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: COLORS.textPrimary,
    marginBottom: SIZES.paddingSm,
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
