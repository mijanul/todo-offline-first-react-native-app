import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Checkbox } from '../atoms/Checkbox';
import { Task } from '../../types';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onPress: (taskId: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onPress,
}) => {
  const { theme } = useTheme();

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.card }]}
      onPress={() => onPress(task.id)}
      activeOpacity={0.7}
    >
      <Checkbox
        checked={task.completed}
        onPress={() => onToggleComplete(task.id)}
      />
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: theme.colors.text },
            task.completed && styles.completedText,
          ]}
        >
          {task.title}
        </Text>
        {task.description && (
          <Text
            style={[styles.description, { color: theme.colors.textSecondary }]}
            numberOfLines={2}
          >
            {task.description}
          </Text>
        )}
        {task.dueDate && (
          <Text style={[styles.dueDate, { color: theme.colors.textSecondary }]}>
            Due: {formatDate(task.dueDate)}
          </Text>
        )}
      </View>
      {!task.synced && (
        <View
          style={[
            styles.syncIndicator,
            { backgroundColor: theme.colors.warning },
          ]}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  description: {
    fontSize: 14,
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 12,
    marginTop: 4,
  },
  syncIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 4,
  },
});
