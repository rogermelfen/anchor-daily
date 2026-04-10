// ============================================
// Anchor Daily - Authentication Screen
// ============================================
// Supports: Sign Up, Sign In, Forgot Password, and
// Password Reset (via deep link anchordaily://reset-password).

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { Button } from '../components';
import { supabase } from '../services/supabase';
import { useAppStore } from '../store/useAppStore';

interface AuthScreenProps {
  navigation: any;
}

type AuthMode = 'signup' | 'signin' | 'forgot' | 'reset';

export const AuthScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const [mode, setMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, selectedFocus } = useAppStore();

  // ============================================
  // Deep Link: Handle incoming reset-password URL
  // ============================================
  const initialUrlHandled = React.useRef(false);

  useEffect(() => {
    // Handle URL that launched the app (cold start) — only once per session
    if (!initialUrlHandled.current) {
      initialUrlHandled.current = true;
      Linking.getInitialURL().then((url) => {
        if (url) handleDeepLink(url);
      });
    }

    // Handle URL received while app is already open (warm start)
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, []);

  const handleDeepLink = (url: string) => {
    try {
      const parsed = Linking.parse(url);
      const type = parsed.queryParams?.type as string | undefined;
      if (type === 'recovery') {
        setMode('reset');
      }
    } catch (err) {
      console.warn('Failed to parse deep link URL:', err);
    }
  };

  // ============================================
  // Reset Password (after deep link)
  // ============================================
  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Missing Fields', 'Please fill in both password fields.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Passwords Do Not Match', 'Please make sure both passwords are identical.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      Alert.alert(
        'Password Updated',
        'Your password has been changed successfully. You can now sign in with your new password.',
        [
          {
            text: 'Sign In',
            onPress: () => {
              setNewPassword('');
              setConfirmPassword('');
              setMode('signin');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Forgot Password (send reset email)
  // ============================================
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Missing Email', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'anchordaily://reset-password',
      });

      if (error) throw error;

      Alert.alert(
        'Check Your Email',
        'We sent a password reset link to your email. Tap the link in the email to set a new password.',
        [{ text: 'OK', onPress: () => setMode('signin') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Sign Up / Sign In
  // ============================================
  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Information', 'Please enter both email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (data.session?.user) {
          const now = new Date();
          const trialEnd = new Date(now);
          trialEnd.setDate(trialEnd.getDate() + 14);

          const { error: insertError } = await supabase.from('users').insert({
            id: data.session.user.id,
            email: data.session.user.email,
            selected_focus: selectedFocus,
            is_premium: false,
            subscription_status: 'trial',
            trial_start_date: now.toISOString(),
            trial_end_date: trialEnd.toISOString(),
          });

          if (insertError) {
            console.warn('Could not create user profile:', insertError.message);
          }

          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (profile) {
            setUser(profile);
          }

          navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        } else if (data.user && !data.session) {
          // Email confirmation required — let the user continue as a guest
          // while they wait for the confirmation email
          Alert.alert(
            'Check your email',
            'We sent a confirmation link to ' +
              email.trim() +
              '. Tap the link to activate your account.\n\nYou can use the app in the meantime.',
            [
              {
                text: 'Continue',
                onPress: () =>
                  navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] }),
              },
            ]
          );
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (data.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            setUser(profile);
          }

          navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Render: Reset Password (deep link mode)
  // ============================================
  if (mode === 'reset') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.title}>Set New Password</Text>
              <Text style={styles.subtitle}>
                Choose a strong password for your account. It must be at least 6 characters.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="At least 6 characters"
                  placeholderTextColor={COLORS.textMuted}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  autoFocus
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Repeat your new password"
                  placeholderTextColor={COLORS.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              <Button
                title="Update Password"
                onPress={handleResetPassword}
                loading={loading}
                size="large"
                style={styles.authButton}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ============================================
  // Render: Forgot Password (send email)
  // ============================================
  if (mode === 'forgot') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity style={styles.closeButton} onPress={() => setMode('signin')}>
              <Ionicons name="close" size={28} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we will send you a link to reset your password.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <Button
                title="Send Reset Link"
                onPress={handleForgotPassword}
                loading={loading}
                size="large"
                style={styles.authButton}
              />
            </View>

            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>Remember your password?</Text>
              <TouchableOpacity onPress={() => setMode('signin')}>
                <Text style={styles.toggleLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ============================================
  // Render: Sign Up / Sign In
  // ============================================
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </Text>
            <Text style={styles.subtitle}>
              {mode === 'signup'
                ? 'Sign up to save your journal, start your 14-day free trial, and sync across devices.'
                : 'Sign in to access your journal and reflections.'}
            </Text>
          </View>

          {/* Trial badge for sign up */}
          {mode === 'signup' && (
            <View style={styles.trialBadge}>
              <Ionicons name="gift-outline" size={18} color={COLORS.primary} />
              <Text style={styles.trialBadgeText}>
                Includes 14-day free Premium trial — no credit card required
              </Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Forgot password link (only on sign in) */}
            {mode === 'signin' && (
              <TouchableOpacity
                onPress={() => setMode('forgot')}
                style={styles.forgotButton}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            <Button
              title={mode === 'signup' ? 'Create Account & Start Trial' : 'Sign In'}
              onPress={handleAuth}
              loading={loading}
              size="large"
              style={styles.authButton}
            />
          </View>

          {/* Toggle */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            <TouchableOpacity onPress={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>
              <Text style={styles.toggleLink}>{mode === 'signup' ? 'Sign In' : 'Sign Up'}</Text>
            </TouchableOpacity>
          </View>

          {/* Continue without account */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
          >
            <Text style={styles.skipText}>Continue without account</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.paddingLg,
    paddingTop: SIZES.paddingMd,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: SIZES.paddingSm,
  },
  header: {
    marginTop: SIZES.paddingMd,
    marginBottom: SIZES.paddingLg,
  },
  title: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginTop: SIZES.paddingSm,
  },
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.paddingSm,
    backgroundColor: COLORS.primary + '10',
    borderRadius: SIZES.radiusMd,
    padding: SIZES.paddingSm + 4,
    marginBottom: SIZES.paddingLg,
  },
  trialBadgeText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: COLORS.primaryDark,
    fontWeight: '500',
  },
  form: {
    gap: SIZES.paddingMd,
  },
  inputGroup: {
    gap: SIZES.paddingXs + 2,
  },
  label: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.paddingMd,
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  authButton: {
    marginTop: SIZES.paddingSm,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.paddingSm,
    marginTop: SIZES.paddingLg,
  },
  toggleText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  toggleLink: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    marginTop: SIZES.paddingMd,
    paddingVertical: SIZES.paddingSm,
  },
  skipText: {
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
  },
});
