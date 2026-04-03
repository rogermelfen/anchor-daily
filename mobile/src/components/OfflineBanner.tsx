// ============================================
// Anchor Daily - Offline Banner
// ============================================
// Shown at the top of screens when the app detects
// it is using fallback content due to network issues.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SIZES } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';

export const OfflineBanner: React.FC = () => {
  const lastError = useAppStore((s) => s.lastError);

  if (!lastError) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>{lastError}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FFF3CD',
    paddingVertical: SIZES.paddingSm,
    paddingHorizontal: SIZES.paddingMd,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE69C',
  },
  text: {
    fontSize: 13,
    color: '#856404',
    textAlign: 'center' as const,
  },
});
