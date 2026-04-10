// ============================================
// Anchor Daily - Splash / Loading Screen
// ============================================
// Shown on every app launch while initializing.
// Fades in on mount, fades out before handing off
// to the main navigator.

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

interface LoadingScreenProps {
  onReady?: () => void;
  isAppReady?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onReady,
  isAppReady = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const minTimeReached = useRef(false);
  const appReadyRef = useRef(false);

  // Fade + scale in on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: false,
      }),
    ]).start();

    // Minimum display time: 2 seconds
    const timer = setTimeout(() => {
      minTimeReached.current = true;
      if (appReadyRef.current) {
        fadeOut();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // When app finishes initializing
  useEffect(() => {
    if (isAppReady) {
      appReadyRef.current = true;
      if (minTimeReached.current) {
        fadeOut();
      }
    }
  }, [isAppReady]);

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: false,
    }).start(() => {
      onReady?.();
    });
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.iconArea, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconCircle}>
          <Ionicons name="book-outline" size={48} color={COLORS.primary} />
        </View>
      </Animated.View>
      <Text style={styles.appName}>Anchor Daily</Text>
      <Text style={styles.tagline}>Faith for your everyday life.</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  iconArea: {
    marginBottom: SIZES.paddingLg,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.paddingXs + 2,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});
