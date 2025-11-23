import notifee, {
  AndroidImportance,
  TriggerType,
  TimestampTrigger,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';

class NotificationService {
  async initialize(): Promise<void> {
    // Request permissions
    await this.requestPermission();

    // Create notification channel for Android
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: 'task-reminders',
        name: 'Task Reminders',
        importance: AndroidImportance.HIGH,
      });
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
  }

  async requestPermission(): Promise<boolean> {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Notification permission granted');
    }

    return enabled;
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
    };

    const notificationId = await notifee.createTriggerNotification(
      {
        id: `task-${taskId}`,
        title: 'Task Reminder',
        body: title,
        android: {
          channelId: 'task-reminders',
          importance: AndroidImportance.HIGH,
        },
      },
      trigger,
    );

    return notificationId;
  }

  async cancelNotification(taskId: string): Promise<void> {
    await notifee.cancelNotification(`task-${taskId}`);
  }

  async cancelAllNotifications(): Promise<void> {
    await notifee.cancelAllNotifications();
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
