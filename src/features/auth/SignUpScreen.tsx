import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import ThemedStatusBar from '../../components/ThemedStatusBar';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { firebaseService } from '../../services/firebase/firebaseService';
import { useAppDispatch } from '../../store/hooks';
import { setUser, setLoading, setError } from '../../store/slices/authSlice';
import { ThemeToggle } from '../../components/ThemeToggle';
import type { AuthStackParamList } from '../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

const { width } = Dimensions.get('window');

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoadingState] = useState(false);
  const [authError, setAuthError] = useState('');

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  // Map Firebase error codes to user-friendly messages
  const getFriendlyError = (error: any) => {
    if (!error || !error.code) return 'An unknown error occurred.';
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already in use.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/operation-not-allowed':
        return 'Operation not allowed. Please contact support.';
      case 'auth/weak-password':
        return 'Password is too weak.';
      default:
        return error.message || 'Sign up failed.';
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoadingState(true);
    dispatch(setLoading(true));
    setAuthError('');

    try {
      const userCredential = await firebaseService.signUp(email, password);
      dispatch(
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
        }),
      );
    } catch (error: any) {
      dispatch(setError(error.message));
      setAuthError(getFriendlyError(error));
    } finally {
      setLoadingState(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <ThemedStatusBar>
      <LinearGradient
        colors={
          isDark
            ? ['#0A84FF', '#0066CC', '#1C1C1E']
            : ['#007AFF', '#5AC8FA', '#F5F5F7']
        }
        style={styles.gradient}
      >
        <ThemeToggle />
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={[styles.title, styles.whiteText]}>
                Create Account
              </Text>
              <Text style={[styles.subtitle, styles.subtitleWhite]}>
                Join us to start organizing your life
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Email"
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  setAuthError('');
                }}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={emailError}
                leftIcon={<Text style={styles.icon}>✉️</Text>}
              />
              <Input
                label="Password"
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  setAuthError('');
                }}
                placeholder="Enter your password"
                secureTextEntry
                error={passwordError}
                leftIcon={<Text style={styles.icon}>🔒</Text>}
              />
              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={text => {
                  setConfirmPassword(text);
                  setAuthError('');
                }}
                placeholder="Confirm your password"
                secureTextEntry
                error={confirmPasswordError}
                leftIcon={<Text style={styles.icon}>🔒</Text>}
              />

              {authError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{authError}</Text>
                </View>
              ) : null}

              <View style={styles.buttonContainer}>
                <Button
                  title="Sign Up"
                  onPress={handleSignUp}
                  loading={loading}
                  fullWidth
                  gradientColors={['#4c669f', '#3b5998', '#192f6a']}
                  disabled={!email || !password || !confirmPassword}
                />
              </View>
            </View>

            <View style={styles.footer}>
              <Text
                style={[
                  styles.footerText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.footerText, styles.footerTextBold]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ThemedStatusBar>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  form: {
    marginBottom: 32,
  },
  buttonContainer: {
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e53935',
  },
  errorText: {
    color: '#e53935',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  whiteText: {
    color: '#FFFFFF',
  },
  subtitleWhite: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  icon: {
    fontSize: 18,
  },
  footerTextBold: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
