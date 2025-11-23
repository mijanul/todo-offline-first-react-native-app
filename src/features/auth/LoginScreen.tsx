import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
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

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const { width } = Dimensions.get('window');

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoadingState] = useState(false);

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

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoadingState(true);
    dispatch(setLoading(true));

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
      Alert.alert('Login Failed', error.message);
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
              <Text style={[styles.title, { color: '#FFFFFF' }]}>
                Welcome Back
              </Text>
              <Text
                style={[styles.subtitle, { color: 'rgba(255, 255, 255, 0.9)' }]}
              >
                Sign in to continue managing your tasks
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={emailError}
                leftIcon={<Text style={{ fontSize: 18 }}>✉️</Text>}
              />
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                error={passwordError}
                leftIcon={<Text style={{ fontSize: 18 }}>🔒</Text>}
              />

              <View style={styles.buttonContainer}>
                <Button
                  title="Sign In"
                  onPress={handleLogin}
                  loading={loading}
                  fullWidth
                  gradientColors={['#4c669f', '#3b5998', '#192f6a']}
                  disabled={!email || !password}
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
              <Button
                title="Create Account"
                onPress={() => navigation.navigate('SignUp')}
                variant="text"
                fullWidth
                textColor="#FFFFFF"
              />
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
    alignItems: 'center',
    gap: 16,
  },
  footerText: {
    fontSize: 14,
  },
});
