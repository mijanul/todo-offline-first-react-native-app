import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamList } from '../types';
import { TaskListScreen } from '../features/tasks/TaskListScreen';
import { TaskDetailScreen } from '../features/tasks/TaskDetailScreen';
import { AddTaskScreen } from '../features/tasks/AddTaskScreen';
import { EditTaskScreen } from '../features/tasks/EditTaskScreen';
import { NotificationTestScreen } from '../screens/NotificationTestScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    // @ts-expect-error - React Navigation v7 strict typing issue
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="TaskList"
        component={TaskListScreen}
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
