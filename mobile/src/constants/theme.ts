// ============================================
// Anchor Daily - Design System / Theme
// ============================================
// Supports both light and dark mode.
// The active palette is selected via useTheme() hook
// which reads the user's preference from the store.
//
// Usage in components:
//   import { useTheme } from '../constants/theme';
//   const { colors, shadows } = useTheme();

import { useColorScheme } from 'react-native';
import { useAppStore } from '../store/useAppStore';

// ---- Color palettes ----

export const LIGHT_COLORS = {
  // Primary palette
  primary: '#7C9A8E',        // Muted sage green
  primaryDark: '#5E7D71',    // Darker sage
  primaryLight: '#A8C4B8',   // Lighter sage

  // Background
  background: '#F5F0EB',     // Warm off-white / linen
  surface: '#FFFFFF',        // Card surfaces
  surfaceAlt: '#EDE8E3',     // Alternate surface

  // Text
  textPrimary: '#2C2C2C',   // Near-black for body text
  textSecondary: '#6B6B6B', // Gray for secondary text
  textMuted: '#9B9B9B',     // Muted text
  textOnPrimary: '#FFFFFF', // White text on primary buttons

  // Accent
  accent: '#D4A574',         // Warm gold/amber for highlights
  accentLight: '#E8C9A0',

  // Status
  success: '#7C9A8E',
  warning: '#D4A574',
  error: '#C47070',

  // Borders
  border: '#E0DBD5',
  borderLight: '#EDE8E3',

  // Overlay
  overlay: 'rgba(0,0,0,0.4)',
};

export const DARK_COLORS = {
  // Primary palette (slightly brighter for dark backgrounds)
  primary: '#8FB0A3',
  primaryDark: '#7C9A8E',
  primaryLight: '#5E7D71',

  // Background
  background: '#1A1A1E',     // Deep charcoal
  surface: '#2A2A2E',        // Card surfaces
  surfaceAlt: '#333338',     // Alternate surface

  // Text
  textPrimary: '#E8E4E0',   // Warm off-white
  textSecondary: '#A0A0A0', // Muted gray
  textMuted: '#6B6B6B',     // Dimmed text
  textOnPrimary: '#FFFFFF', // White text on primary buttons

  // Accent
  accent: '#D4A574',
  accentLight: '#B08A5C',

  // Status
  success: '#8FB0A3',
  warning: '#D4A574',
  error: '#D47070',

  // Borders
  border: '#3A3A3E',
  borderLight: '#2F2F33',

  // Overlay
  overlay: 'rgba(0,0,0,0.6)',
};

// ---- Default export for backward compatibility ----
// Components that haven't migrated to useTheme() yet
// will still work with the light palette.
export const COLORS = LIGHT_COLORS;

export type ThemeColors = typeof LIGHT_COLORS;

// ---- Fonts (same for both modes) ----

export const FONTS = {
  heading: {
    fontFamily: 'System',
    fontWeight: '700' as const,
  },
  subheading: {
    fontFamily: 'System',
    fontWeight: '600' as const,
  },
  body: {
    fontFamily: 'System',
    fontWeight: '400' as const,
  },
  bodyBold: {
    fontFamily: 'System',
    fontWeight: '600' as const,
  },
  caption: {
    fontFamily: 'System',
    fontWeight: '400' as const,
  },
};

// ---- Sizes (same for both modes) ----

export const SIZES = {
  // Font sizes
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 34,

  // Spacing
  paddingXs: 4,
  paddingSm: 8,
  paddingMd: 16,
  paddingLg: 24,
  paddingXl: 32,
  paddingXxl: 48,

  // Border radius
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 999,
};

// ---- Shadows ----

export const LIGHT_SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const DARK_SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Default export for backward compatibility
export const SHADOWS = LIGHT_SHADOWS;

// ---- Theme mode type ----

export type ThemeMode = 'light' | 'dark' | 'system';

// ---- useTheme hook ----

export function useTheme() {
  const systemScheme = useColorScheme();
  const themeMode = useAppStore((s) => s.themeMode);

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

  return {
    isDark,
    colors: isDark ? DARK_COLORS : LIGHT_COLORS,
    shadows: isDark ? DARK_SHADOWS : LIGHT_SHADOWS,
    fonts: FONTS,
    sizes: SIZES,
  };
}
