// ============================================
// Anchor Daily - Reflect & Pray Screen
// ============================================
// Shown when the user taps "Reflect & Pray" on Today.
// Displays today's reflection question and lets the
// user write a journal response directly here.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';

interface ReflectScreenProps {
  navigation: any;
}

export const ReflectScreen: React.FC<ReflectScreenProps> = ({ navigation }) => {
  const { todayReflection, saveJournalEntry, isAuthenticated } = useAppStore();
  const [entry, setEntry] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!entry.trim()) return;

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
      await saveJournalEntry(entry.trim(), todayReflection?.id);
      Alert.alert(
        'Saved',
        'Your reflection has been saved to your journal.',
        [{ text: 'Done', onPress: () => navigation.goBack() }]
      );
    } catch {
      Alert.alert('Error', 'Could not save your entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Ionicons name="help-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.headerText}>Reflect & Pray</Text>
          </View>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Question */}
          {todayReflection?.question ? (
            <View style={styles.questionCard}>
              <Text style={styles.question}>{todayReflection.question}</Text>
            </View>
          ) : (
            <View style={styles.questionCard}>
              <Text style={styles.question}>
                Take a moment to sit quietly. What is God speaking to you through today's reflection?
              </Text>
            </View>
          )}

          {/* Journal input */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Your thoughts & prayers</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Write freely — this is your private space..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              value={entry}
              onChangeText={setEntry}
              maxLength={3000}
              autoFocus
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Save button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, (!entry.trim() || saving) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!entry.trim() || saving}
            activeOpacity={0.8}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={entry.trim() && !saving ? COLORS.textOnPrimary : COLORS.textMuted}
            />
            <Text style={[styles.saveText, (!entry.trim() || saving) && styles.saveTextDisabled]}>
              {saving ? 'Saving...' : 'Save to Journal'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.paddingMd,
    paddingVertical: SIZES.paddingSm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.paddingXs + 2,
  },
  headerText: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.paddingLg,
    gap: SIZES.paddingMd,
  },
  questionCard: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingLg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  question: {
    fontSize: SIZES.md + 1,
    color: COLORS.textPrimary,
    lineHeight: 28,
    fontStyle: 'italic',
  },
  inputCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingMd,
    ...SHADOWS.small,
    minHeight: 180,
  },
  inputLabel: {
    fontSize: SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SIZES.paddingSm,
  },
  textInput: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 24,
    minHeight: 140,
  },
  footer: {
    paddingHorizontal: SIZES.paddingLg,
    paddingBottom: SIZES.paddingMd,
    paddingTop: SIZES.paddingSm,
    gap: SIZES.paddingXs,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.paddingSm,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.paddingMd,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.surfaceAlt,
  },
  saveText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textOnPrimary,
  },
  saveTextDisabled: {
    color: COLORS.textMuted,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: SIZES.paddingSm,
  },
  skipText: {
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
  },
});
