// ============================================
// Anchor Daily - Reusable Button Component
// ============================================
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: SIZES.radiusMd,
      alignItems: 'center',
      justifyContent: 'center',
    };

    // Size
    switch (size) {
      case 'small':
        base.paddingVertical = SIZES.paddingSm;
        base.paddingHorizontal = SIZES.paddingMd;
        break;
      case 'large':
        base.paddingVertical = SIZES.paddingMd + 2;
        base.paddingHorizontal = SIZES.paddingXl;
        break;
      default:
        base.paddingVertical = SIZES.paddingMd;
        base.paddingHorizontal = SIZES.paddingLg;
    }

    // Variant
    switch (variant) {
      case 'secondary':
        base.backgroundColor = COLORS.surfaceAlt;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1.5;
        base.borderColor = COLORS.primary;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        break;
      default:
        base.backgroundColor = COLORS.primary;
        Object.assign(base, SHADOWS.small);
    }

    if (disabled) {
      base.opacity = 0.5;
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontWeight: '600',
    };

    switch (size) {
      case 'small':
        base.fontSize = SIZES.sm;
        break;
      case 'large':
        base.fontSize = SIZES.lg;
        break;
      default:
        base.fontSize = SIZES.md;
    }

    switch (variant) {
      case 'secondary':
        base.color = COLORS.textPrimary;
        break;
      case 'outline':
      case 'ghost':
        base.color = COLORS.primary;
        break;
      default:
        base.color = COLORS.textOnPrimary;
    }

    return base;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[getButtonStyle(), style]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? COLORS.textOnPrimary : COLORS.primary}
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
