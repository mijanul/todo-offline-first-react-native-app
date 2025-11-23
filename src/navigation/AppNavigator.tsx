import React, { Suspense, lazy } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { AppStackParamList } from '../types';
import { TabNavigator } from './TabNavigator';
import { useTheme } from '../theme/ThemeContext';

// Lazy load screens
const TaskDetailScreen = lazy(() =>
  import('../features/tasks/TaskDetailScreen').then(module => ({
    default: module.TaskDetailScreen,
  })),
);
const TaskFormScreen = lazy(() =>
  import('../features/tasks/TaskFormScreen').then(module => ({
    default: module.TaskFormScreen,
  })),
);
const NotificationTestScreen = lazy(() =>
  import('../features/notifications/NotificationTestScreen').then(module => ({
    default: module.NotificationTestScreen,
  })),
);

const Stack = createNativeStackNavigator<AppStackParamList>();

const LoadingFallback = () => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.loadingContainer,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
};

export const AppNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Suspense fallback={<LoadingFallback />}>
      {/* @ts-expect-error - React Navigation v7 strict typing issue */}
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: theme.colors.card,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          headerShadowVisible: true,
        }}
      >
        <Stack.Screen
          name="Tabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TaskDetail"
          component={TaskDetailScreen}
          options={{
            headerShown: true,
            title: 'Task Details',
          }}
        />
        <Stack.Screen
          name="TaskForm"
          component={TaskFormScreen}
          options={({ route }) => ({
            headerShown: true,
            title:
              route?.params && (route.params as any).taskId
                ? 'Edit Task'
                : 'Add Task',
            presentation: 'modal',
          })}
        />
        <Stack.Screen
          name="NotificationTest"
          component={NotificationTestScreen}
          options={{
            headerShown: true,
            title: 'Notification Test',
          }}
        />
      </Stack.Navigator>
    </Suspense>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
