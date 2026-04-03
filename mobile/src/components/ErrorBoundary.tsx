// ============================================
// Anchor Daily - Error Boundary
// ============================================
// Catches unhandled JS errors in the component tree
// and shows a friendly fallback screen instead of a
// white screen / crash.

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>!</Text>
          </View>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.props.fallbackMessage ||
              "We're sorry — an unexpected error occurred. Please try again."}
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SIZES.paddingXl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.paddingLg,
  },
  iconText: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: COLORS.textPrimary,
    marginBottom: SIZES.paddingSm,
    textAlign: 'center' as const,
  },
  message: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: SIZES.paddingXl,
    paddingHorizontal: SIZES.paddingLg,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.paddingXl,
    paddingVertical: SIZES.paddingMd,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
