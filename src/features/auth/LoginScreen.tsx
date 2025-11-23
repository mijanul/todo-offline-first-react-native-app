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
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import ThemedStatusBar from '../../components/ThemedStatusBar';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { firebaseService } from '../../services/firebase/firebaseService';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setUser, setLoading, setError } from '../../store/slices/authSlice';
import { ThemeToggle } from '../../components/ThemeToggle';
import type { AuthStackParamList } from '../../types';
import type { RootState } from '../../store';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const { width } = Dimensions.get('window');

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const isConnected = useAppSelector(
    (state: RootState) => state.network.isConnected,
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoadingState] = useState(false);
  const [authError, setAuthError] = useState('');

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

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

    return isValid;
  };

  // Map Firebase error codes to user-friendly messages
  const getFriendlyError = (error: any) => {
    if (!error || !error.code) return 'An unknown error occurred.';
    switch (error.code) {
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return error.message || 'Authentication failed.';
    }
  };

  const handleLogin = async () => {
    if (!isConnected) {
      Alert.alert(
        'No Internet Connection',
        'Please check your internet connection and try again.',
        [{ text: 'OK' }],
      );
      return;
    }

    if (!validateForm()) return;

    setLoadingState(true);
    dispatch(setLoading(true));
    setAuthError('');

    try {
      const userCredential = await firebaseService.signIn(email, password);
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
              <Text style={[styles.title, styles.whiteText]}>Welcome Back</Text>
              <Text style={[styles.subtitle, styles.subtitleWhite]}>
                Sign in to continue managing your tasks
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

              {authError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{authError}</Text>
                </View>
              ) : null}

              <View style={styles.buttonContainer}>
                <Button
                  title="Sign In"
                  onPress={handleLogin}
                  loading={loading}
                  fullWidth
                  gradientColors={['#4c669f', '#3b5998', '#192f6a']}
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
                Don't have an account?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={[styles.footerText, styles.footerTextBold]}>
                  Sign Up
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
