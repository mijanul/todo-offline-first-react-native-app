import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamList } from '../types';
import { TabNavigator } from './TabNavigator';
import { TaskDetailScreen } from '../features/tasks/TaskDetailScreen';
import { AddTaskScreen } from '../features/tasks/AddTaskScreen';
import { EditTaskScreen } from '../features/tasks/EditTaskScreen';
import { NotificationTestScreen } from '../screens/NotificationTestScreen';
import { useTheme } from '../theme/ThemeContext';

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    // @ts-expect-error - React Navigation v7 strict typing issue
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
        name="AddTask"
        component={AddTaskScreen}
        options={{
          headerShown: true,
          title: 'Add Task',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="EditTask"
        component={EditTaskScreen}
        options={{
          headerShown: true,
          title: 'Edit Task',
          presentation: 'modal',
        }}
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
  );
};
