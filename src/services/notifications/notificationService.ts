import notifee, {
  AndroidImportance,
  TriggerType,
  TimestampTrigger,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';

class NotificationService {
  async initialize(): Promise<void> {
    console.log('🔔 Initializing notification service...');

    // Request permissions
    const permissionGranted = await this.requestPermission();
    console.log('🔔 Permission request completed. Granted:', permissionGranted);

    // Create notification channel for Android
    if (Platform.OS === 'android') {
      console.log('🔔 Creating Android notification channel...');
      await notifee.createChannel({
        id: 'task-reminders',
        name: 'Task Reminders',
        importance: AndroidImportance.HIGH,
        vibration: true,
        vibrationPattern: [300, 500],
      });
    }

    // Get FCM token if permission granted
    if (permissionGranted) {
      await this.getFCMToken();
    }

    // Handle background messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background message:', remoteMessage);
      await this.displayNotification(
        remoteMessage.notification?.title || 'New notification',
        remoteMessage.notification?.body || '',
      );
    });

    // Handle foreground messages
    messaging().onMessage(async remoteMessage => {
      console.log('Foreground message:', remoteMessage);
      await this.displayNotification(
        remoteMessage.notification?.title || 'New notification',
        remoteMessage.notification?.body || '',
      );
    });

    console.log('🔔 Notification service initialized successfully');
  }

  async requestPermission(): Promise<boolean> {
    try {
      console.log('🔔 Requesting notification permission...');

      if (Platform.OS === 'android') {
        // For Android, use Notifee to properly request system notification permission
        console.log(
          '🔔 Requesting Android notification permission via Notifee...',
        );

        // Check current permission status
        const settings = await notifee.requestPermission();
        console.log('🔔 Notifee permission settings:', settings);

        const enabled = settings.authorizationStatus >= 1; // 1 = AUTHORIZED, 2 = PROVISIONAL

        if (enabled) {
          console.log('✅ Android notification permission granted');
          // Also request FCM permission for remote notifications
          await messaging().requestPermission();
        } else {
          console.log('❌ Android notification permission denied');
        }

        return enabled;
      } else {
        // For iOS, use Firebase messaging permission
        console.log(
          '🔔 Requesting iOS notification permission via Firebase...',
        );

        const authStatus = await messaging().requestPermission();
        console.log('🔔 iOS permission request result:', authStatus);

        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('✅ iOS notification permission granted');
        } else {
          console.log('❌ iOS notification permission denied');
        }

        return enabled;
      }
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      return false;
    }
  }

  async checkPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        // For Android, use Notifee to check actual system permission status
        const settings = await notifee.getNotificationSettings();
        return settings.authorizationStatus >= 2; // 2 = AUTHORIZED
      } else {
        // For iOS, use Firebase messaging
        const authStatus = await messaging().hasPermission();
        return (
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
      }
    } catch (error) {
      console.error('❌ Error checking notification permission:', error);
      return false;
    }
  }

  async getPermissionStatus(): Promise<{
    granted: boolean;
    status: string;
    authorizationStatus?: number;
  }> {
    try {
      if (Platform.OS === 'android') {
        const settings = await notifee.getNotificationSettings();
        const statusMap: { [key: number]: string } = {
          0: 'NOT_DETERMINED',
          1: 'DENIED',
          2: 'AUTHORIZED',
          3: 'PROVISIONAL',
        };
        return {
          granted: settings.authorizationStatus >= 2,
          status: statusMap[settings.authorizationStatus] || 'UNKNOWN',
          authorizationStatus: settings.authorizationStatus,
        };
      } else {
        const authStatus = await messaging().hasPermission();
        const statusMap: { [key: number]: string } = {
          [messaging.AuthorizationStatus.NOT_DETERMINED]: 'NOT_DETERMINED',
          [messaging.AuthorizationStatus.DENIED]: 'DENIED',
          [messaging.AuthorizationStatus.AUTHORIZED]: 'AUTHORIZED',
          [messaging.AuthorizationStatus.PROVISIONAL]: 'PROVISIONAL',
        };
        return {
          granted:
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL,
          status: statusMap[authStatus] || 'UNKNOWN',
          authorizationStatus: authStatus,
        };
      }
    } catch (error) {
      console.error('❌ Error getting permission status:', error);
      return {
        granted: false,
        status: 'ERROR',
      };
    }
  }

  async getFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  async displayNotification(title: string, body: string): Promise<void> {
    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: 'task-reminders',
        importance: AndroidImportance.HIGH,
      },
    });
  }

  async scheduleTaskReminder(
    taskId: string,
    title: string,
    timestamp: number,
  ): Promise<string> {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp,
      alarmManager: {
        allowWhileIdle: true,
      },
    };

    const notificationId = await notifee.createTriggerNotification(
      {
        id: `task-${taskId}`,
        title: '⏰ Task Reminder',
        body: title,
        android: {
          channelId: 'task-reminders',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
          sound: 'default',
          vibrationPattern: [300, 500],
          showTimestamp: true,
          timestamp: timestamp,
        },
        ios: {
          sound: 'default',
          critical: true,
          criticalVolume: 1.0,
        },
      },
      trigger,
    );

    console.log(
      '📅 Scheduled notification:',
      notificationId,
      'for',
      new Date(timestamp),
    );
    return notificationId;
  }

  async cancelNotification(taskId: string): Promise<void> {
    await notifee.cancelNotification(`task-${taskId}`);
    console.log('🔕 Cancelled notification for task:', taskId);
  }

  async cancelAllNotifications(): Promise<void> {
    await notifee.cancelAllNotifications();
  }

  async getTriggerNotifications(): Promise<any[]> {
    const notifications = await notifee.getTriggerNotifications();
    return notifications;
  }

  async rescheduleNotifications(
    tasks: Array<{ id: string; title: string; reminderTime?: number }>,
  ): Promise<void> {
    console.log('🔄 Rescheduling notifications for', tasks.length, 'tasks');

    for (const task of tasks) {
      if (task.reminderTime && task.reminderTime > Date.now()) {
        await this.scheduleTaskReminder(task.id, task.title, task.reminderTime);
      }
    }

    console.log('✅ Notifications rescheduled');
  }

  onNotificationOpened(callback: (notification: any) => void): () => void {
    return notifee.onForegroundEvent(({ type, detail }) => {
      console.log('Notification event:', type, detail);
      if (detail.notification) {
        callback(detail.notification);
      }
    });
  }
}

export const notificationService = new NotificationService();
