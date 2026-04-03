// ============================================
// Practical Christian Daily - Focus Area Selector Component
// ============================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { FocusArea } from '../types';

interface FocusSelectorProps {
  selected: FocusArea | null;
  onSelect: (focus: FocusArea) => void;
}

const FOCUS_OPTIONS: {
  key: FocusArea;
  title: string;
  subtitle: string;
  verse: string;
  icon: string;
}[] = [
  {
    key: 'stress',
    title: 'Stress & Anxiety',
    subtitle: 'Finding peace and rest in God when life feels overwhelming',
    verse: '"Cast all your anxiety on him." — 1 Pet. 5:7',
    icon: 'leaf-outline',
  },
  {
    key: 'decisions',
    title: 'Difficult Decisions',
    subtitle: 'Seeking God\'s wisdom and discernment at life\'s crossroads',
    verse: '"Trust in the Lord with all your heart." — Prov. 3:5',
    icon: 'compass-outline',
  },
  {
    key: 'relationships',
    title: 'Relationships & Conflict',
    subtitle: 'Loving others well through grace, forgiveness, and truth',
    verse: '"Bear with each other and forgive." — Col. 3:13',
    icon: 'heart-outline',
  },
];

export const FocusSelector: React.FC<FocusSelectorProps> = ({ selected, onSelect }) => {
  return (
    <View style={styles.container}>
      {FOCUS_OPTIONS.map((option) => {
        const isSelected = selected === option.key;
        return (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.option,
              isSelected && styles.optionSelected,
            ]}
            onPress={() => onSelect(option.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
              <Ionicons
                name={option.icon as any}
                size={24}
                color={isSelected ? COLORS.textOnPrimary : COLORS.primary}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.title, isSelected && styles.titleSelected]}>
                {option.title}
              </Text>
              <Text style={styles.subtitle}>{option.subtitle}</Text>
              <Text style={[styles.verse, isSelected && styles.verseSelected]}>
                {option.verse}
              </Text>
            </View>
            {isSelected && (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SIZES.paddingSm + 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingMd + 4,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.small,
  },
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.paddingMd,
    marginTop: 2,
  },
  iconContainerSelected: {
    backgroundColor: COLORS.primary,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  titleSelected: {
    color: COLORS.primaryDark,
  },
  subtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  verse: {
    fontSize: SIZES.xs,
    color: COLORS.primary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  verseSelected: {
    color: COLORS.primaryDark,
  },
});
