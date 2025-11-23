import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/atoms/Button';
import ThemedStatusBar from '../../components/ThemedStatusBar';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleTheme } from '../../store/slices/themeSlice';
import { clearAuth } from '../../store/slices/authSlice';
import { firebaseService } from '../../services/firebase/firebaseService';
import LinearGradient from 'react-native-linear-gradient';
import type { RootState } from '../../store';

const { width } = Dimensions.get('window');

export const SettingsScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: any) => state.auth.user);
  const themeMode = useAppSelector((state: any) => state.theme.mode);
  const isConnected = useAppSelector(
    (state: RootState) => state.network.isConnected,
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isDarkMode = themeMode === 'dark';

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleLogout = () => {
    if (!isConnected) {
      Alert.alert(
        'No Internet Connection',
        'Please check your internet connection to logout.',
        [{ text: 'OK' }],
      );
      return;
    }

    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await firebaseService.signOut();
              dispatch(clearAuth());
            } catch (error: any) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <ThemedStatusBar>
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={
            isDark
              ? ['#0A84FF', '#0066CC', '#1C1C1E']
              : ['#007AFF', '#5AC8FA', '#F5F5F7']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Manage your preferences</Text>
          </View>

          {/* Profile Card in Header */}
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(255, 255, 255, 0.95)',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'rgba(255, 255, 255, 0.5)',
              },
            ]}
          >
            <View style={styles.avatarLarge}>
              <LinearGradient
                colors={['#007AFF', '#5AC8FA']}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarTextLarge}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </LinearGradient>
            </View>
            <View style={styles.userInfoLarge}>
              <Text
                style={[
                  styles.userNameLarge,
                  { color: isDark ? '#FFFFFF' : theme.colors.text },
                ]}
              >
                {user?.displayName || 'User'}
              </Text>
              <Text
                style={[
                  styles.userEmailLarge,
                  {
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.7)'
                      : theme.colors.textSecondary,
                  },
                ]}
              >
                {user?.email || 'No email'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Appearance Section */}
          <View style={styles.sectionContainer}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              APPEARANCE
            </Text>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDark
                    ? 'rgba(28, 28, 30, 0.8)'
                    : 'rgba(255, 255, 255, 0.9)',
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.05)',
                },
              ]}
            >
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: isDark
                          ? 'rgba(10, 132, 255, 0.2)'
                          : 'rgba(0, 122, 255, 0.1)',
                      },
                    ]}
                  >
                    {isDarkMode ? <MoonIcon /> : <SunIcon />}
                  </View>
                  <View style={styles.settingInfo}>
                    <Text
                      style={[
                        styles.settingLabel,
                        { color: theme.colors.text },
                      ]}
                    >
                      Dark Mode
                    </Text>
                    <Text
                      style={[
                        styles.settingDescription,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {isDarkMode
                        ? 'Dark theme enabled'
                        : 'Light theme enabled'}
                    </Text>
                  </View>
                </View>
                <AnimatedSwitch
                  value={isDarkMode}
                  onValueChange={handleThemeToggle}
                  activeColor={theme.colors.primary}
                />
              </View>
            </View>
          </View>

          {/* Account Section */}
          <View style={styles.sectionContainer}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              ACCOUNT
            </Text>
            <Button
              title={isLoggingOut ? 'Logging out...' : 'Logout'}
              onPress={handleLogout}
              loading={isLoggingOut}
              fullWidth
              gradientColors={
                isDark ? ['#FF453A', '#FF6961'] : ['#FF3B30', '#FF2D55']
              }
              icon={<LogoutIcon color="#FFFFFF" />}
              disabled={!isConnected || isLoggingOut}
            />
            {!isConnected && (
              <Text
                style={[styles.offlineWarning, { color: theme.colors.error }]}
              >
                Logout requires internet connection
              </Text>
            )}
          </View>

          {/* App Info */}
          <View style={styles.appInfo}>
            <View
              style={[
                styles.appInfoCard,
                {
                  backgroundColor: isDark
                    ? 'rgba(28, 28, 30, 0.5)'
                    : 'rgba(255, 255, 255, 0.5)',
                },
              ]}
            >
              <Text
                style={[
                  styles.appInfoText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Todo App v1.0.0
              </Text>
              <Text
                style={[
                  styles.appInfoSubtext,
                  { color: theme.colors.textTertiary },
                ]}
              >
                Offline-First Task Manager
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </ThemedStatusBar>
  );
};

// Animated Switch Component
const AnimatedSwitch: React.FC<{
  value: boolean;
  onValueChange: () => void;
  activeColor: string;
}> = ({ value, onValueChange, activeColor }) => {
  const { theme, isDark } = useTheme();
  const translateX = useRef(new Animated.Value(value ? 22 : 2)).current;
  const backgroundColor = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: value ? 22 : 2,
        useNativeDriver: true,
        friction: 6,
        tension: 100,
      }),
      Animated.timing(backgroundColor, {
        toValue: value ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [value]);

  const bgColor = backgroundColor.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
      activeColor,
    ],
  });

  return (
    <TouchableOpacity onPress={onValueChange} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.switchContainer,
          {
            backgroundColor: bgColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.switchThumb,
            {
              transform: [{ translateX }],
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

// Modern Icons
const SunIcon = () => (
  <View
    style={{
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <View
      style={{
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FF9500',
      }}
    />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
      <View
        key={index}
        style={{
          position: 'absolute',
          width: 2,
          height: 6,
          backgroundColor: '#FF9500',
          borderRadius: 1,
          transform: [{ rotate: `${angle}deg` }, { translateY: -9 }],
        }}
      />
    ))}
  </View>
);

const MoonIcon = () => (
  <View
    style={{
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <View
      style={{
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#0A84FF',
      }}
    />
    <View
      style={{
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        left: 6,
        top: 2,
      }}
    />
  </View>
);

const LogoutIcon: React.FC<{ color: string }> = ({ color }) => (
  <View
    style={{
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <View
      style={{
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: color,
        borderRightWidth: 0,
        transform: [{ translateX: -2 }],
      }}
    />
    <View
      style={{
        position: 'absolute',
        width: 10,
        height: 2,
        backgroundColor: color,
        right: 2,
      }}
    />
    <View
      style={{
        position: 'absolute',
        width: 5,
        height: 5,
        borderTopWidth: 2,
        borderRightWidth: 2,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
        right: 1,
        top: 7.5,
      }}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 140,
    paddingHorizontal: 24,
  },
  headerContent: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTextLarge: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userInfoLarge: {
    flex: 1,
  },
  userNameLarge: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmailLarge: {
    fontSize: 15,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    marginTop: -120,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 3,
  },
  settingDescription: {
    fontSize: 14,
    fontWeight: '500',
  },
  arrowIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchContainer: {
    width: 52,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    padding: 2,
  },
  switchThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  appInfoCard: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  appInfoText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  appInfoSubtext: {
    fontSize: 12,
    fontWeight: '500',
  },
  offlineWarning: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
});
