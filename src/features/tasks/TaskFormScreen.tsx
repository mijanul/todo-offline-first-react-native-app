import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import ThemedStatusBar from '../../components/ThemedStatusBar';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { RootState } from '../../store';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { DateTimePicker } from '../../components/atoms/DateTimePicker';
import { notificationService } from '../../services/notifications/notificationService';
import { addTask, updateTask } from '../../store/slices/tasksSlice';
import { realmService } from '../../services/database/realmService';
import { syncService } from '../../services/sync/syncService';
import type { AppStackParamList } from '../../types';

type Props = NativeStackScreenProps<AppStackParamList, 'TaskForm'>;

export const TaskFormScreen: React.FC<Props> = ({ navigation, route }) => {
  // Accept optional taskId param for edit mode
  const taskId =
    route && route.params
      ? ((route.params as any).taskId as string | undefined)
      : undefined;
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const task = useAppSelector((state: RootState) =>
    taskId ? state.tasks.tasks.find(t => t.id === taskId) : undefined,
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderTime, setReminderTime] = useState<Date | undefined>(undefined);
  const [titleError, setTitleError] = useState('');
  const [reminderError, setReminderError] = useState('');
  // Prefill fields if editing
  useEffect(() => {
    if (taskId && task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setReminderTime(
        task.reminderTime ? new Date(task.reminderTime) : undefined,
      );
    } else if (!taskId) {
      // Add mode: set defaults
      setTitle('');
      setDescription('');
      const defaultTime = new Date();
      defaultTime.setMinutes(defaultTime.getMinutes() + 5);
      setReminderTime(defaultTime);
    }
  }, [taskId, task]);
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    setTitleError('');
    setReminderError('');

    if (!title.trim()) {
      setTitleError('Title is required');
      return false;
    }

    if (!reminderTime) {
      setReminderError('Reminder time is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) return;
    setLoading(true);
    try {
      if (taskId && task) {
        // Edit mode
        const updatedTask = await realmService.updateTask(taskId, user.uid, {
          title: title.trim(),
          description: description.trim() || undefined,
          reminderTime: reminderTime?.getTime(),
        });
        if (updatedTask) {
          await notificationService.cancelNotification(taskId);
          if (reminderTime && reminderTime.getTime() > Date.now()) {
            await notificationService.scheduleTaskReminder(
              updatedTask.id,
              updatedTask.title,
              reminderTime.getTime(),
            );
          }
          dispatch(updateTask(updatedTask));
          syncService.syncLocalToRemote();
          navigation.goBack();
        }
      } else {
        // Add mode
        const newTask = await realmService.createTask({
          userId: user.uid,
          title: title.trim(),
          description: description.trim() || undefined,
          completed: false,
          reminderTime: reminderTime.getTime(),
        });
        await notificationService.scheduleTaskReminder(
          newTask.id,
          newTask.title,
          reminderTime.getTime(),
        );
        dispatch(addTask(newTask));
        syncService.syncLocalToRemote();
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        taskId ? 'Failed to update task' : 'Failed to create task',
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // If editing and task not found, return null
  if (taskId && !task) return null;

  return (
    <ThemedStatusBar>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.card]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {taskId ? 'Edit Task' : 'New Task'}
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Title"
                value={title}
                onChangeText={setTitle}
                placeholder={
                  taskId ? 'Enter task title' : 'What needs to be done?'
                }
                error={titleError}
              />
              <Input
                label="Description (Optional)"
                value={description}
                onChangeText={setDescription}
                placeholder={
                  taskId ? 'Enter task description' : 'Add details...'
                }
                multiline
                numberOfLines={4}
                style={styles.textArea}
              />
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  label="Reminder Time"
                  value={reminderTime}
                  onChange={setReminderTime}
                  mode="datetime"
                  error={reminderError}
                  required
                  minimumDate={new Date()}
                  disabled={
                    taskId &&
                    task?.reminderTime &&
                    task.reminderTime < Date.now()
                  }
                />
              </View>

              <View style={styles.buttons}>
                <Button
                  title="Cancel"
                  onPress={() => navigation.goBack()}
                  variant="secondary"
                  style={styles.button}
                />
                <Button
                  title={taskId ? 'Update Task' : 'Create Task'}
                  onPress={handleSubmit}
                  loading={loading}
                  style={styles.button}
                  variant="primary"
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ThemedStatusBar>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  form: {
    flex: 1,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  datePickerContainer: {
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12, // Match TaskDetailScreen
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
});
