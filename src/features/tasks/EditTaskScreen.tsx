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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import ThemedStatusBar from '../../components/ThemedStatusBar';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { DateTimePicker } from '../../components/atoms/DateTimePicker';
import { notificationService } from '../../services/notifications/notificationService';
import { updateTask } from '../../store/slices/tasksSlice';
import { realmService } from '../../services/database/realmService';
import { syncService } from '../../services/sync/syncService';
import type { AppStackParamList, Task } from '../../types';
import type { RootState } from '../../store';

type Props = NativeStackScreenProps<AppStackParamList, 'EditTask'>;

export const EditTaskScreen: React.FC<Props> = ({ navigation, route }) => {
  const { taskId } = route.params;
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const task = useAppSelector((state: RootState) =>
    state.tasks.tasks.find((t: Task) => t.id === taskId),
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderTime, setReminderTime] = useState<Date | undefined>();
  const [titleError, setTitleError] = useState('');
  const [loading, setLoading] = useState(false);

  const isPast = task?.reminderTime ? task.reminderTime < Date.now() : false;

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setReminderTime(
        task.reminderTime ? new Date(task.reminderTime) : undefined,
      );
    } else {
      navigation.goBack();
    }
  }, [task, navigation]);

  const validateForm = (): boolean => {
    setTitleError('');
    if (!title.trim()) {
      setTitleError('Title is required');
      return false;
    }
    return true;
  };

  const handleUpdateTask = async () => {
    if (!validateForm() || !user) return;

    setLoading(true);

    try {
      const updatedTask = await realmService.updateTask(taskId, user.uid, {
        title: title.trim(),
        description: description.trim() || undefined,
        reminderTime: reminderTime?.getTime(),
      });

      if (updatedTask) {
        // Cancel existing notification
        await notificationService.cancelNotification(taskId);

        // Schedule new notification if reminder time is set
        // Schedule new notification if reminder time is set and in the future
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
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update task');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!task) return null;

  return (
    <ThemedStatusBar>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { backgroundColor: theme.colors.background },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Edit Task
            </Text>

            <View style={styles.form}>
              <Input
                label="Title"
                value={title}
                onChangeText={setTitle}
                placeholder="Enter task title"
                error={titleError}
              />
              <Input
                label="Description (Optional)"
                value={description}
                onChangeText={setDescription}
                placeholder="Enter task description"
                multiline
                numberOfLines={4}
                style={styles.textArea}
              />
              <DateTimePicker
                label="Reminder Time (Optional)"
                value={reminderTime}
                onChange={setReminderTime}
                mode="datetime"
                disabled={isPast}
                minimumDate={new Date()}
              />

              <View style={styles.buttons}>
                <Button
                  title="Cancel"
                  onPress={() => navigation.goBack()}
                  variant="secondary"
                  style={styles.button}
                />
                <Button
                  title="Update"
                  onPress={handleUpdateTask}
                  loading={loading}
                  style={styles.button}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedStatusBar>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  form: {
    flex: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
});
