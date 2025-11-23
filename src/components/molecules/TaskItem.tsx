import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Checkbox } from '../atoms/Checkbox';
import { Task } from '../../types';
import LinearGradient from 'react-native-linear-gradient';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onPress: (taskId: string) => void;
}

const TaskItemComponent: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onPress,
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = () => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  };

  const isDueToday = () => {
    if (!task.dueDate) return false;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return dueDate.toDateString() === today.toDateString();
  };

  const getAccentColor = () => {
    if (isOverdue()) return theme.colors.error;
    if (isDueToday()) return theme.colors.warning;
    return theme.colors.primary;
  };

  const getGradientColors = () => {
    const isDark = theme.colors.background === '#000000';
    if (task.completed) {
      return isDark
        ? ['rgba(28, 28, 30, 0.95)', 'rgba(44, 44, 46, 0.95)']
        : ['rgba(255, 255, 255, 0.95)', 'rgba(250, 250, 250, 0.95)'];
    }
    return isDark
      ? ['rgba(28, 28, 30, 0.98)', 'rgba(44, 44, 46, 0.98)']
      : ['rgba(255, 255, 255, 0.98)', 'rgba(255, 255, 255, 0.95)'];
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => onPress(task.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.container,
            {
              shadowColor: theme.colors.shadow,
              borderColor: task.completed
                ? theme.colors.borderLight
                : 'transparent',
            },
          ]}
        >
          {/* Accent Border */}
          <View
            style={[
              styles.accentBorder,
              {
                backgroundColor: task.completed
                  ? theme.colors.success
                  : getAccentColor(),
                opacity: task.completed ? 0.5 : 1,
              },
            ]}
          />

          {/* Content Container */}
          <View style={styles.contentWrapper}>
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
                numberOfLines={2}
              >
                {task.title}
              </Text>
              {task.description && (
                <Text
                  style={[
                    styles.description,
                    { color: theme.colors.textSecondary },
                    task.completed && styles.completedDescription,
                  ]}
                  numberOfLines={2}
                >
                  {task.description}
                </Text>
              )}
              {task.dueDate && (
                <View style={styles.metaContainer}>
                  <View
                    style={[
                      styles.dueDateBadge,
                      {
                        backgroundColor: isOverdue()
                          ? `${theme.colors.error}15`
                          : isDueToday()
                          ? `${theme.colors.warning}15`
                          : `${theme.colors.primary}10`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dueDate,
                        {
                          color: isOverdue()
                            ? theme.colors.error
                            : isDueToday()
                            ? theme.colors.warning
                            : theme.colors.primary,
                        },
                      ]}
                    >
                      📅 {formatDate(task.dueDate)}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Sync Indicator */}
            {!task.synced && (
              <View style={styles.syncContainer}>
                <View
                  style={[
                    styles.syncIndicator,
                    { backgroundColor: theme.colors.warning },
                  ]}
                />
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const TaskItem = React.memo(TaskItemComponent);

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 6,
    marginHorizontal: 16,
  },
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  accentBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  contentWrapper: {
    flexDirection: 'row',
    padding: 16,
    paddingLeft: 20,
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.2,
    lineHeight: 24,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  description: {
    fontSize: 15,
    marginBottom: 8,
    lineHeight: 20,
    opacity: 0.8,
  },
  completedDescription: {
    opacity: 0.4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dueDateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  dueDate: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  syncContainer: {
    marginLeft: 8,
    marginTop: 4,
  },
  syncIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
