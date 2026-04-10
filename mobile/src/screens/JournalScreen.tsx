// ============================================
// Anchor Daily - Journal Screen
// ============================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { Card } from '../components';
import { useAppStore } from '../store/useAppStore';
import { JournalEntry } from '../types';

interface JournalScreenProps {
  navigation: any;
}

export const JournalScreen: React.FC<JournalScreenProps> = ({ navigation }) => {
  const {
    journalEntries,
    fetchJournalEntries,
    saveJournalEntry,
    isAuthenticated,
    isPremium,
    todayReflection,
  } = useAppStore();
  const [newEntry, setNewEntry] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchJournalEntries();
    }
  }, [isAuthenticated]);

  const handleSave = async () => {
    if (!newEntry.trim()) return;

    if (!isAuthenticated) {
      Alert.alert(
        'Create an Account',
        'Sign up for free to save your journal entries and track your growth.',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Sign Up', onPress: () => navigation.navigate('Auth') },
        ]
      );
      return;
    }

    setSaving(true);
    try {
      const entry = await saveJournalEntry(newEntry.trim(), todayReflection?.id);
      if (entry) {
        setNewEntry('');
      } else {
        Alert.alert('Error', 'Could not save your entry. Please try again.');
      }
    } catch {
      Alert.alert('Error', 'Could not save your entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderEntry = ({ item }: { item: JournalEntry }) => {
    const date = new Date(item.created_at);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <Card style={styles.entryCard}>
        <Text style={styles.entryDate}>{dateStr}</Text>
        <Text style={styles.entryContent}>{item.content}</Text>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Journal</Text>
          <Text style={styles.subtitle}>A private space for your thoughts and prayers</Text>
        </View>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="What's on your mind today?"
            placeholderTextColor={COLORS.textMuted}
            multiline
            value={newEntry}
            onChangeText={setNewEntry}
            maxLength={2000}
          />
          <TouchableOpacity
            style={[styles.saveButton, !newEntry.trim() && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!newEntry.trim() || saving}
          >
            <Ionicons
              name="send"
              size={20}
              color={newEntry.trim() ? COLORS.textOnPrimary : COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Entries List */}
        {!isAuthenticated ? (
          <View style={styles.emptyState}>
            <Ionicons name="lock-closed-outline" size={48} color={COLORS.primaryLight} />
            <Text style={styles.emptyTitle}>Your journal is private</Text>
            <Text style={styles.emptySubtitle}>
              Create a free account to save your entries and look back on your journey.
            </Text>
          </View>
        ) : journalEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="journal-outline" size={48} color={COLORS.primaryLight} />
            <Text style={styles.emptyTitle}>Start writing</Text>
            <Text style={styles.emptySubtitle}>
              Your journal entries will appear here. Write your first thought above.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>Recent Entries</Text>
              {!isPremium && journalEntries.length > 5 && (
                <TouchableOpacity onPress={() => navigation.navigate('Paywall')}>
                  <Text style={styles.seeAllText}>See all with Premium</Text>
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={isPremium ? journalEntries : journalEntries.slice(0, 5)}
              renderItem={renderEntry}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginHorizontal: SIZES.paddingLg,
    marginVertical: SIZES.paddingSm,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingSm,
    ...SHADOWS.small,
  },
  textInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    paddingHorizontal: SIZES.paddingSm,
    paddingTop: SIZES.paddingSm,
    textAlignVertical: 'top',
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.surfaceAlt,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.paddingLg,
    marginTop: SIZES.paddingSm,
    marginBottom: SIZES.paddingXs,
  },
  listHeaderText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  seeAllText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: SIZES.paddingLg,
    paddingBottom: SIZES.paddingXxl,
  },
  entryCard: {
    padding: SIZES.paddingMd,
  },
  entryDate: {
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginBottom: SIZES.paddingXs,
  },
  entryContent: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 24,
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
