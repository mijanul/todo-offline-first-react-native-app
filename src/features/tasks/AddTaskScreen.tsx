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
      syncService.syncLocalToRemote();
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
                New Task
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Title"
                value={title}
                onChangeText={setTitle}
                placeholder="What needs to be done?"
                error={titleError}
                leftIcon={<Text style={{ fontSize: 18 }}>📝</Text>}
              />
              <Input
                label="Description (Optional)"
                value={description}
                onChangeText={setDescription}
                placeholder="Add details..."
                multiline
                numberOfLines={4}
                style={styles.textArea}
                leftIcon={<Text style={{ fontSize: 18 }}>📄</Text>}
              />
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  label="Reminder Time"
                  value={reminderTime}
                  onChange={setReminderTime}
                  mode="datetime"
                  error={reminderError}
                  required
                />
              </View>

              <View style={styles.buttons}>
                <Button
                  title="Cancel"
                  onPress={() => navigation.goBack()}
                  variant="outline"
                  style={styles.button}
                />
                <Button
                  title="Create Task"
                  onPress={handleCreateTask}
                  loading={loading}
                  style={styles.button}
                  gradientColors={['#4c669f', '#3b5998', '#192f6a']}
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
    gap: 16,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
});
