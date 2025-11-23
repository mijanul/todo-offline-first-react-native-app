import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { notificationService } from '../../services/notifications/notificationService';
import ThemedStatusBar from '../../components/ThemedStatusBar';

export const NotificationTestScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<string>('Checking...');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadTokenAndPermissions();
  }, []);

  const loadTokenAndPermissions = async () => {
    try {
      const status = await notificationService.getPermissionStatus();
      setPermissionStatus(status.status);

      if (status.granted) {
        const token = await notificationService.getFCMToken();
        setFcmToken(token);
      }
    } catch (error) {
      console.error('Error loading token:', error);
    }
  };

  const copyToClipboard = () => {
    if (fcmToken) {
      Clipboard.setString(fcmToken);
    }
  };

  const handleRequestPermission = async () => {
    setLoading(true);
    const granted = await notificationService.requestPermission();
    setLoading(false);
    if (granted) {
      loadTokenAndPermissions();
      Alert.alert('Success', 'Permission granted');
    } else {
      Alert.alert(
        'Permission Denied',
        'Please enable notifications in settings',
      );
    }
  };

  const handleTestNotification = async () => {
    await notificationService.displayNotification(
      'Test Notification',
      'This is a test notification from the app',
    );
  };

  const handleScheduleNotification = async () => {
    const time = Date.now() + 5000; // 5 seconds from now
    await notificationService.scheduleTaskReminder(
      'test-id',
      'Scheduled Test Notification',
      time,
    );
    Alert.alert('Scheduled', 'Notification scheduled for 5 seconds from now');
  };

  // Dynamic styles for theme and state
  const themedStyles = StyleSheet.create({
    containerBg: {
      backgroundColor: theme.colors.background,
    },
    cardBg: {
      backgroundColor: isDark
        ? 'rgba(28, 28, 30, 0.8)'
        : 'rgba(255, 255, 255, 0.9)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    },
    cardTitleColor: {
      color: theme.colors.text,
    },
    cardSubtitleColor: {
      color: theme.colors.textSecondary,
    },
    refreshText: {
      color: theme.colors.primary,
      fontWeight: '600' as const,
    },
    statusTextColor: {
      color: theme.colors.textSecondary,
    },
    buttonBg: {
      backgroundColor: theme.colors.primary,
    },
    buttonWarningBg: {
      backgroundColor: theme.colors.warning,
    },
    outlineButtonBorder: {
      borderColor: theme.colors.primary,
    },
    outlineButtonTextColor: {
      color: theme.colors.primary,
    },
    statusIndicatorGranted: {
      backgroundColor: '#34C759',
    },
    statusIndicatorDenied: {
      backgroundColor: '#FF3B30',
    },
  });

  return (
    <ThemedStatusBar>
      <View style={[styles.container, themedStyles.containerBg]}>
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
            <Text style={styles.headerTitle}>Notification Test</Text>
            <Text style={styles.headerSubtitle}>
              Debug and test push notifications
            </Text>
          </View>
        </LinearGradient>

        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Permission Status Card */}
          <View style={[styles.card, themedStyles.cardBg]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, themedStyles.cardTitleColor]}>
                Permission Status
              </Text>
              <TouchableOpacity onPress={loadTokenAndPermissions}>
                <Text style={themedStyles.refreshText}>Refresh</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusIndicator,
                  permissionStatus === 'AUTHORIZED' ||
                  permissionStatus === 'PROVISIONAL'
                    ? themedStyles.statusIndicatorGranted
                    : themedStyles.statusIndicatorDenied,
                ]}
              />
              <Text style={[styles.statusText, themedStyles.statusTextColor]}>
                {permissionStatus}
              </Text>
            </View>
            {permissionStatus !== 'AUTHORIZED' &&
              permissionStatus !== 'PROVISIONAL' && (
                <TouchableOpacity
                  style={[styles.button, themedStyles.buttonBg]}
                  onPress={handleRequestPermission}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Request Permission</Text>
                </TouchableOpacity>
              )}
          </View>

          {/* FCM Token Card */}
          <View style={[styles.card, themedStyles.cardBg]}>
            <Text style={[styles.cardTitle, themedStyles.cardTitleColor]}>
              FCM Token
            </Text>
            <Text
              style={[styles.tokenText, themedStyles.cardSubtitleColor]}
              numberOfLines={4}
            >
              {fcmToken || 'No token available (Check permissions)'}
            </Text>
            {fcmToken && (
              <TouchableOpacity
                style={[styles.outlineButton, themedStyles.outlineButtonBorder]}
                onPress={copyToClipboard}
              >
                <Text
                  style={[
                    styles.outlineButtonText,
                    themedStyles.outlineButtonTextColor,
                  ]}
                >
                  Copy Token
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Testing Actions Card */}
          <View style={[styles.card, themedStyles.cardBg]}>
            <Text style={[styles.cardTitle, themedStyles.cardTitleColor]}>
              Test Actions
            </Text>
            <View style={styles.spacer} />
            <TouchableOpacity
              style={[styles.button, themedStyles.buttonBg]}
              onPress={handleTestNotification}
            >
              <Text style={styles.buttonText}>Trigger Local Notification</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonMarginTop,
                themedStyles.buttonWarningBg,
              ]}
              onPress={handleScheduleNotification}
            >
              <Text style={styles.buttonText}>Schedule (5s)</Text>
            </TouchableOpacity>
          </View>

          {/* Guide Card */}
          <View style={[styles.card, themedStyles.cardBg]}>
            <Text style={[styles.cardTitle, themedStyles.cardTitleColor]}>
              How to Send Remote Notifications
            </Text>
            <Text style={[styles.guideText, themedStyles.cardSubtitleColor]}>
              1. Copy the FCM Token above.{'\n'}
              2. Go to Firebase Console {'>'} Cloud Messaging.{'\n'}
              3. Create a new campaign.{'\n'}
              4. Paste the token in "Test on device".{'\n'}
              5. Send test message.{'\n\n'}
              Or use a tool like Postman to send a POST request to FCM API with
              this token.
            </Text>
          </View>
        </ScrollView>
      </View>
    </ThemedStatusBar>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 80,
    paddingHorizontal: 24,
  },
  headerContent: {
    marginBottom: 16,
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
  scrollView: {
    flex: 1,
    marginTop: -40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  tokenText: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 16,
    lineHeight: 20,
  },
  guideText: {
    fontSize: 14,
    lineHeight: 22,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonMarginTop: {
    marginTop: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 12,
  },
});
