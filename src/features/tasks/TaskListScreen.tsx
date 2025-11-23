import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import ThemedStatusBar from '../../components/ThemedStatusBar';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { RootState } from '../../store';
import { TaskItem } from '../../components/molecules/TaskItem';
import { Button } from '../../components/atoms/Button';
import { setTasks, toggleTaskComplete } from '../../store/slices/tasksSlice';
import { realmService } from '../../services/database/realmService';
import { syncService } from '../../services/sync/syncService';
import type { AppStackParamList, Task } from '../../types';

type Props = NativeStackScreenProps<AppStackParamList, 'TaskList'>;

export const TaskListScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { tasks, filter } = useAppSelector((state: RootState) => state.tasks);
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!user) return;
    const localTasks = await realmService.getAllTasks(user.uid);
    dispatch(setTasks(localTasks));
  }, [user, dispatch]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    if (user) {
      syncService.startAutoSync(user.uid);
    }
    return () => {
      syncService.stopAutoSync();
    };
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await syncService.syncTasks(user.uid);
      await loadTasks();
    }
    setRefreshing(false);
  };

  const handleToggleComplete = async (taskId: string) => {
    const task = tasks.find((t: Task) => t.id === taskId);
    if (task && user) {
      await realmService.updateTask(taskId, { completed: !task.completed });
      dispatch(toggleTaskComplete(taskId));
      syncService.syncTasks(user.uid);
    }
  };

  const handleTaskPress = (taskId: string) => {
    navigation.navigate('TaskDetail', { taskId });
  };

  const filteredTasks = tasks.filter((task: Task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const renderTask = ({ item }: { item: Task }) => (
    <TaskItem
      task={item}
      onToggleComplete={handleToggleComplete}
      onPress={handleTaskPress}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
        No tasks yet. Create your first task!
      </Text>
    </View>
  );

  return (
    <ThemedStatusBar>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            My Tasks
          </Text>
          <View style={styles.filterContainer}>
            {(['all', 'active', 'completed'] as const).map(f => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterButton,
                  filter === f && {
                    backgroundColor: theme.colors.primary,
                  },
                ]}
                onPress={() =>
                  dispatch({ type: 'tasks/setFilter', payload: f })
                }
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === f && styles.activeFilterText,
                    filter !== f && { color: theme.colors.textSecondary },
                  ]}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
          initialNumToRender={10}
        />

        <View style={styles.fabContainer}>
          <Button
            title="+ Add Task"
            onPress={() => navigation.navigate('AddTask')}
          />
        </View>
      </View>
    </ThemedStatusBar>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});
