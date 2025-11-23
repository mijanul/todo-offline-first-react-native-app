import React, { useState } from 'react';
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
import type { RootState } from '../../store';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { DateTimePicker } from '../../components/atoms/DateTimePicker';
import { notificationService } from '../../services/notifications/notificationService';
import { addTask } from '../../store/slices/tasksSlice';
import { realmService } from '../../services/database/realmService';
import { syncService } from '../../services/sync/syncService';
import type { AppStackParamList } from '../../types';

type Props = NativeStackScreenProps<AppStackParamList, 'AddTask'>;

export const AddTaskScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderTime, setReminderTime] = useState<Date>(() => {
    const defaultTime = new Date();
    defaultTime.setMinutes(defaultTime.getMinutes() + 5);
    return defaultTime;
  });
  const [titleError, setTitleError] = useState('');
  const [reminderError, setReminderError] = useState('');
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

  const handleCreateTask = async () => {
    if (!validateForm() || !user) return;

    setLoading(true);

    try {
      const newTask = await realmService.createTask({
        userId: user.uid,
        title: title.trim(),
        description: description.trim() || undefined,
        completed: false,
        reminderTime: reminderTime.getTime(),
      });

      // Schedule notification for reminder time
      await notificationService.scheduleTaskReminder(
        newTask.id,
        newTask.title,
        reminderTime.getTime(),
      );

      dispatch(addTask(newTask));
      syncService.syncTasks(user.uid);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to create task');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedStatusBar>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              New Task
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
                label="Reminder Time"
                value={reminderTime}
                onChange={setReminderTime}
                mode="datetime"
                error={reminderError}
                required
              />

              <View style={styles.buttons}>
                <Button
                  title="Cancel"
                  onPress={() => navigation.goBack()}
                  variant="secondary"
                  style={styles.button}
                />
                <Button
                  title="Create"
                  onPress={handleCreateTask}
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
