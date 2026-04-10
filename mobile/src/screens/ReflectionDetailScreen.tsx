// ============================================
// Anchor Daily - Reflection Detail Screen
// ============================================
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { Card } from '../components';
import { useAppStore } from '../store/useAppStore';

interface ReflectionDetailScreenProps {
  navigation: any;
  route: { params?: { reflectionId?: string } };
}

export const ReflectionDetailScreen: React.FC<ReflectionDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const reflectionId = route.params?.reflectionId;
  const { reflectionHistory, fetchReflectionHistory, isPremium } = useAppStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If history hasn't been loaded yet, fetch it now
    if (reflectionId && reflectionHistory.length === 0) {
      setLoading(true);
      fetchReflectionHistory().finally(() => setLoading(false));
    }
  }, [reflectionId]);

  const reflection = reflectionId
    ? reflectionHistory.find((r) => r.id === reflectionId)
    : undefined;

  if (!reflectionId || (!reflection && !loading)) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Reflection not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading && !reflection) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // TypeScript guard — all code paths above return if reflection is undefined
  if (!reflection) return null;

  const date = new Date(reflection.publish_date);
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.dateText}>{dateStr}</Text>

        <Card style={styles.card}>
          <Text style={styles.title}>{reflection.title}</Text>
          <View style={styles.divider} />
          <Text style={styles.body}>{reflection.short_reflection}</Text>

          {isPremium && reflection.premium_extended_version && (
            <>
              <View style={styles.sectionSeparator} />
              <View style={styles.sectionHeader}>
                <Ionicons name="book-outline" size={16} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Extended Reflection</Text>
              </View>
              <Text style={styles.body}>{reflection.premium_extended_version}</Text>
            </>
          )}
        </Card>

        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb-outline" size={16} color={COLORS.accent} />
            <Text style={styles.sectionTitle}>Live It Out</Text>
          </View>
          <Text style={styles.body}>{reflection.practical_application}</Text>
        </Card>

        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle-outline" size={16} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Reflect & Pray</Text>
          </View>
          <Text style={[styles.body, styles.italic]}>{reflection.question}</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    padding: SIZES.paddingMd,
    paddingBottom: SIZES.paddingSm,
  },
  scrollContent: {
    paddingHorizontal: SIZES.paddingLg,
    paddingBottom: SIZES.paddingXxl,
  },
  dateText: {
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SIZES.paddingMd,
  },
  card: {
    marginBottom: SIZES.paddingMd,
  },
  title: {
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
  body: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 26,
  },
  italic: {
    fontStyle: 'italic',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.paddingXs + 2,
    marginBottom: SIZES.paddingSm,
  },
  sectionTitle: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SIZES.paddingMd,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
});
