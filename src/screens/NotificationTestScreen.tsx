import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useTheme } from '../theme/ThemeContext';
import { notificationService } from '../services/notifications/notificationService';
import { Button } from '../components/atoms/Button';

export const NotificationTestScreen: React.FC = () => {
  const { theme } = useTheme();
  const [fcmToken, setFcmToken] = useState<string>('');
  const [permissionStatus, setPermissionStatus] = useState<string>('');
  const [scheduledNotifications, setScheduledNotifications] = useState<any[]>(
    [],
  );

  useEffect(() => {
    checkPermissionStatus();
    getFCMToken();
    getScheduledNotifications();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      const permissionInfo = await notificationService.getPermissionStatus();
      const emoji = permissionInfo.granted ? '✅' : '❌';
      setPermissionStatus(`${permissionInfo.status} ${emoji}`);
    } catch (error) {
      console.error('Error checking permission:', error);
      setPermissionStatus('ERROR ❌');
    }
  };

  const getFCMToken = async () => {
    try {
      const token = await notificationService.getFCMToken();
      if (token) {
        setFcmToken(token);
        console.log('📱 FCM Token:', token);
      } else {
        setFcmToken('Error getting token');
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      setFcmToken('Error getting token');
    }
  };

  const getScheduledNotifications = async () => {
    try {
      const notifications = await notificationService.getTriggerNotifications();
      setScheduledNotifications(notifications);
      console.log('📅 Scheduled notifications:', notifications);
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
    }
  };

  const requestPermission = async () => {
    const granted = await notificationService.requestPermission();
    console.log('Permission granted:', granted);
    Alert.alert(
      'Permission Result',
      granted ? 'Permission granted! ✅' : 'Permission denied ❌',
    );
    checkPermissionStatus();
    if (granted) {
      getFCMToken();
    }
  };

  const testImmediateNotification = async () => {
    try {
      await notificationService.displayNotification(
        '🔔 Test Notification',
        'This is an immediate test notification!',
      );
      Alert.alert(
        'Success',
        'Notification sent! Check your notification tray.',
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
      console.error(error);
    }
  };

  const testScheduledNotification = async () => {
    try {
      const futureTime = Date.now() + 10000; // 10 seconds from now
      await notificationService.scheduleTaskReminder(
        'test-task-' + Date.now(),
        'Test Scheduled Notification',
        futureTime,
      );
      Alert.alert('Success', 'Notification scheduled for 10 seconds from now!');
      getScheduledNotifications();
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule notification');
      console.error(error);
    }
  };

  const copyTokenToClipboard = () => {
    if (fcmToken && fcmToken !== 'Error getting token') {
      Clipboard.setString(fcmToken);
      Alert.alert('Copied!', 'FCM token copied to clipboard');
    }
  };

  const refreshAll = () => {
    checkPermissionStatus();
    getFCMToken();
    getScheduledNotifications();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          🔔 Notification Test Center
        </Text>

        {/* Permission Status */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Permission Status
          </Text>
          <Text style={[styles.value, { color: theme.colors.textSecondary }]}>
            {permissionStatus || 'Checking...'}
          </Text>
          <Button
            title="Request Permission"
            onPress={requestPermission}
            style={styles.button}
          />
        </View>

        {/* FCM Token */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            FCM Token
          </Text>
          <TouchableOpacity onPress={copyTokenToClipboard}>
            <Text
              style={[styles.token, { color: theme.colors.primary }]}
              numberOfLines={3}
            >
              {fcmToken || 'Loading...'}
            </Text>
            {fcmToken && fcmToken !== 'Error getting token' && (
              <Text
                style={[styles.hint, { color: theme.colors.textSecondary }]}
              >
                Tap to copy
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Test Actions */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Test Notifications
          </Text>
          <Button
            title="Send Immediate Notification"
            onPress={testImmediateNotification}
            style={styles.button}
          />
          <Button
            title="Schedule Notification (10s)"
            onPress={testScheduledNotification}
            style={styles.button}
          />
        </View>

        {/* Scheduled Notifications */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Scheduled Notifications ({scheduledNotifications.length})
          </Text>
          {scheduledNotifications.length === 0 ? (
            <Text style={[styles.value, { color: theme.colors.textSecondary }]}>
              No scheduled notifications
            </Text>
          ) : (
            scheduledNotifications.map((notif, index) => (
              <View key={index} style={styles.notifItem}>
                <Text style={[styles.notifText, { color: theme.colors.text }]}>
                  {notif.notification?.title || 'No title'}
                </Text>
                <Text
                  style={[
                    styles.notifTime,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {new Date(notif.trigger?.timestamp || 0).toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Refresh Button */}
        <Button
          title="🔄 Refresh All"
          onPress={refreshAll}
          variant="secondary"
          style={styles.button}
        />

        {/* Instructions */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            📖 Instructions
          </Text>
          <Text
            style={[styles.instruction, { color: theme.colors.textSecondary }]}
          >
            1. Check permission status{'\n'}
            2. Copy FCM token for testing{'\n'}
            3. Test immediate notification{'\n'}
            4. Test scheduled notification (wait 10s){'\n'}
            5. View scheduled notifications
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  value: {
    fontSize: 16,
    marginBottom: 12,
  },
  token: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  button: {
    marginTop: 8,
  },
  notifItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  notifText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notifTime: {
    fontSize: 12,
    marginTop: 4,
  },
  instruction: {
    fontSize: 14,
    lineHeight: 22,
  },
});
