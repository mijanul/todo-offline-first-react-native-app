import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import ThemedStatusBar from '../../components/ThemedStatusBar';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { RootState } from '../../store';
import { Button } from '../../components/atoms/Button';
import { removeTask } from '../../store/slices/tasksSlice';
import { realmService } from '../../services/database/realmService';
import { syncService } from '../../services/sync/syncService';
import { notificationService } from '../../services/notifications/notificationService';
import type { AppStackParamList, Task } from '../../types';

type Props = NativeStackScreenProps<AppStackParamList, 'TaskDetail'>;

export const TaskDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { taskId } = route.params;
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const task = useAppSelector((state: RootState) =>
    state.tasks.tasks.find((t: Task) => t.id === taskId),
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!task) {
      navigation.goBack();
    }
  }, [task, navigation]);

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!user) return;
          setLoading(true);
          try {
            await realmService.deleteTask(taskId, user.uid);
            await notificationService.cancelNotification(taskId);
            dispatch(removeTask(taskId));
            syncService.syncLocalToRemote();
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Failed to delete task');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Not set';
    return new Date(timestamp).toLocaleDateString();
  };

  const formatDateTime = (timestamp?: number) => {
    if (!timestamp) return 'Not set';
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleString('en-US', options);
  };

  if (!task) return null;

  return (
    <ThemedStatusBar>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {task.title}
            </Text>

            {task.description && (
              <View style={styles.section}>
                <Text
                  style={[styles.label, { color: theme.colors.textSecondary }]}
                >
                  Description
                </Text>
                <Text style={[styles.value, { color: theme.colors.text }]}>
                  {task.description}
                </Text>
              </View>
            )}

            <View style={styles.section}>
              <Text
                style={[styles.label, { color: theme.colors.textSecondary }]}
              >
                Status
              </Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {task.completed ? 'Completed' : 'Active'}
              </Text>
            </View>

            <View style={styles.section}>
              <Text
                style={[styles.label, { color: theme.colors.textSecondary }]}
              >
                Created
              </Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {formatDate(task.createdAt)}
              </Text>
            </View>

            {task.dueDate && (
              <View style={styles.section}>
                <Text
                  style={[styles.label, { color: theme.colors.textSecondary }]}
                >
                  Due Date
                </Text>
                <Text style={[styles.value, { color: theme.colors.text }]}>
                  {formatDate(task.dueDate)}
                </Text>
              </View>
            )}

            {task.reminderTime && (
              <View style={styles.section}>
                <Text
                  style={[styles.label, { color: theme.colors.textSecondary }]}
                >
                  Reminder
                </Text>
                <Text style={[styles.value, { color: theme.colors.text }]}>
                  {formatDateTime(task.reminderTime)}
                </Text>
              </View>
            )}

            <View style={styles.section}>
              <Text
                style={[styles.label, { color: theme.colors.textSecondary }]}
              >
                Sync Status
              </Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {task.synced ? 'Synced' : 'Pending sync'}
              </Text>
            </View>
          </View>

          <View style={styles.buttons}>
            <Button
              title="Edit"
              onPress={() => navigation.navigate('EditTask', { taskId })}
              variant="secondary"
              style={styles.button}
            />
            <Button
              title="Delete"
              onPress={handleDelete}
              variant="danger"
              loading={loading}
              style={styles.button}
            />
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
  content: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
