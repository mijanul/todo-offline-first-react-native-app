/**
 * Todo App - Cross-platform Task Management
 *
 * @format
 */

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store';
import { ThemeProvider } from './src/theme/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { realmService } from './src/services/database/realmService';
import { notificationService } from './src/services/notifications/notificationService';
import ThemedStatusBar from './src/components/ThemedStatusBar';

function App(): React.JSX.Element {
  useEffect(() => {
    // Initialize services
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing app...');
        await realmService.init();
        console.log('✅ Realm initialized');
        await notificationService.initialize();
        console.log('✅ Notification service initialized');

        // Reschedule notifications for tasks with future reminders
        const allTasks = await realmService.getAllTasks('');
        const tasksWithReminders = allTasks
          .filter(task => task.reminderTime && task.reminderTime > Date.now())
          .map(task => ({
            id: task.id,
            title: task.title,
            reminderTime: task.reminderTime,
          }));

        if (tasksWithReminders.length > 0) {
          await notificationService.rescheduleNotifications(tasksWithReminders);
        }

        console.log('✅ App initialization complete');
      } catch (error) {
        console.error('❌ Failed to initialize app:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.message, error.stack);
        }
      }
    };

    initializeApp();

    return () => {
      realmService.close();
    };
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.container}>
          <ThemeProvider>
            <ThemedStatusBar />
            <RootNavigator />
          </ThemeProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
