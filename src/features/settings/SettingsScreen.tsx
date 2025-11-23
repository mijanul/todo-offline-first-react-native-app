import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import ThemedStatusBar from '../../components/ThemedStatusBar';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleTheme } from '../../store/slices/themeSlice';
import { clearAuth } from '../../store/slices/authSlice';
import { firebaseService } from '../../services/firebase/firebaseService';

export const SettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: any) => state.auth.user);
  const themeMode = useAppSelector((state: any) => state.theme.mode);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isDarkMode = themeMode === 'dark';

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleLogout = () => {
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
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
      >
        {/* User Profile Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Profile
          </Text>
          <View style={styles.profileInfo}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: theme.colors.primary + '20' },
              ]}
            >
              <Text
                style={[styles.avatarText, { color: theme.colors.primary }]}
              >
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.colors.text }]}>
                {user?.displayName || 'User'}
              </Text>
              <Text
                style={[
                  styles.userEmail,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {user?.email || 'No email'}
              </Text>
            </View>
          </View>
        </View>

        {/* Appearance Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Appearance
          </Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Dark Mode
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {isDarkMode ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleThemeToggle}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary + '80',
              }}
              thumbColor={isDarkMode ? theme.colors.primary : '#f4f3f4'}
              ios_backgroundColor={theme.colors.border}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Account
          </Text>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            <View style={styles.settingInfo}>
              <Text
                style={[styles.settingLabel, { color: theme.colors.error }]}
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Sign out of your account
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text
            style={[styles.appInfoText, { color: theme.colors.textSecondary }]}
          >
            Todo App v1.0.0
          </Text>
          <Text
            style={[styles.appInfoText, { color: theme.colors.textSecondary }]}
          >
            Offline-First Task Manager
          </Text>
        </View>
      </ScrollView>
    </ThemedStatusBar>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
    opacity: 0.7,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  appInfoText: {
    fontSize: 12,
    marginBottom: 4,
  },
});
