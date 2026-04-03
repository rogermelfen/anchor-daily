// ============================================
// Anchor Daily - History Screen (Premium)
// ============================================
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Card, Button } from '../components';
import { useAppStore } from '../store/useAppStore';
import { Reflection } from '../types';

interface HistoryScreenProps {
  navigation: any;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const { isPremium, reflectionHistory, fetchReflectionHistory, isAuthenticated } =
    useAppStore();

  useEffect(() => {
    fetchReflectionHistory();
  }, []);

  const renderReflection = ({ item }: { item: Reflection }) => {
    const date = new Date(item.publish_date);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return (
      <TouchableOpacity activeOpacity={0.7}>
        <Card style={styles.reflectionCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardDate}>{dateStr}</Text>
            {item.is_premium_only && (
              <View style={styles.premiumTag}>
                <Ionicons name="sparkles" size={10} color={COLORS.accent} />
                <Text style={styles.premiumTagText}>Premium</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardPreview} numberOfLines={2}>
            {item.short_reflection}
          </Text>
        </Card>
      </TouchableOpacity>
    );
  };

  // If not premium, show upgrade prompt
  if (!isPremium) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>History</Text>
        </View>
        <View style={styles.lockedState}>
          <View style={styles.lockedIcon}>
            <Ionicons name="time-outline" size={48} color={COLORS.primaryLight} />
          </View>
          <Text style={styles.lockedTitle}>Look back on your journey</Text>
          <Text style={styles.lockedSubtitle}>
            Premium members can browse past reflections and see how their perspective has grown
            over time.
          </Text>
          <Button
            title="Unlock with Premium"
            onPress={() => navigation.navigate('Paywall')}
            style={styles.upgradeButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>Your past reflections</Text>
      </View>

      {reflectionHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color={COLORS.primaryLight} />
          <Text style={styles.emptyTitle}>No history yet</Text>
          <Text style={styles.emptySubtitle}>
            Your past reflections will appear here as you use the app each day.
          </Text>
        </View>
      ) : (
        <FlatList
          data={reflectionHistory}
          renderItem={renderReflection}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  subtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SIZES.paddingXs,
  },
  listContent: {
    paddingHorizontal: SIZES.paddingLg,
    paddingBottom: SIZES.paddingXxl,
  },
  reflectionCard: {
    padding: SIZES.paddingMd,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.paddingXs,
  },
  cardDate: {
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  premiumTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.accent + '15',
    paddingHorizontal: SIZES.paddingSm,
    paddingVertical: 2,
    borderRadius: SIZES.radiusFull,
  },
  premiumTagText: {
    fontSize: 10,
    color: COLORS.accent,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.paddingXs,
  },
  cardPreview: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  lockedState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.paddingXl,
  },
  lockedIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
    marginBottom: SIZES.paddingLg,
  },
  lockedTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  lockedSubtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.paddingSm,
    lineHeight: 24,
  },
  upgradeButton: {
    marginTop: SIZES.paddingLg,
    paddingHorizontal: SIZES.paddingXl,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.paddingXl,
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
