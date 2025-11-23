import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import ThemedStatusBar from '../../components/ThemedStatusBar';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { RootState } from '../../store';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import { TaskItem } from '../../components/molecules/TaskItem';
import { Button } from '../../components/atoms/Button';
import {
  setTasks,
  toggleTaskComplete,
  setFilter,
} from '../../store/slices/tasksSlice';
import { realmService } from '../../services/database/realmService';
import { syncService } from '../../services/sync/syncService';
import type { Task } from '../../types';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import type { AppStackParamList } from '../../types';
import LinearGradient from 'react-native-linear-gradient';

const ITEM_HEIGHT = 100;
const { width } = Dimensions.get('window');

export const TaskListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { tasks, filter } = useAppSelector((state: RootState) => state.tasks);
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { status, lastSyncedAt } = useSyncStatus();
  const [refreshing, setRefreshing] = useState(false);
  const [showSyncBadge, setShowSyncBadge] = useState(false);
  const fabScale = useRef(new Animated.Value(1)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Auto-hide sync badge after showing "Synced" for 2 seconds
  useEffect(() => {
    if (status === 'syncing') {
      setShowSyncBadge(true);
    } else if (status === 'succeeded') {
      setShowSyncBadge(true);
      const timer = setTimeout(() => {
        setShowSyncBadge(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (status === 'failed') {
      setShowSyncBadge(true);
      const timer = setTimeout(() => {
        setShowSyncBadge(false);
      }, 5000); // Show error for longer
      return () => clearTimeout(timer);
    }
  }, [status]);

  const loadTasks = useCallback(async () => {
    if (!user) return;
    const localTasks = await realmService.getAllTasks(user.uid);
    dispatch(setTasks(localTasks));
  }, [user, dispatch]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await syncService.syncLocalToRemote();
      await loadTasks();
    }
    setRefreshing(false);
  };

  const handleToggleComplete = useCallback(
    async (taskId: string) => {
      const task = tasks.find((t: Task) => t.id === taskId);
      if (task && user) {
        await realmService.updateTask(taskId, user.uid, {
          completed: !task.completed,
        });
        dispatch(toggleTaskComplete(taskId));
        syncService.syncLocalToRemote();
      }
    },
    [tasks, user, dispatch],
  );

  const handleTaskPress = useCallback(
    (taskId: string) => {
      navigation.navigate('TaskDetail', { taskId });
    },
    [navigation],
  );

  const handleFilterPress = useCallback(
    (newFilter: 'active' | 'completed' | 'all') => {
      dispatch(setFilter(newFilter));
    },
    [dispatch],
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task: Task) => {
      if (filter === 'active') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    });
  }, [tasks, filter]);

  const getFilterCounts = useMemo(() => {
    return {
      active: tasks.filter(t => !t.completed).length,
      completed: tasks.filter(t => t.completed).length,
      all: tasks.length,
    };
  }, [tasks]);

  const renderTask = useCallback(
    ({ item }: { item: Task }) => (
      <TaskItem
        task={item}
        onToggleComplete={handleToggleComplete}
        onPress={handleTaskPress}
      />
    ),
    [handleToggleComplete, handleTaskPress],
  );

  const keyExtractor = useCallback((item: Task) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const renderEmptyState = useCallback(() => {
    const emptyMessages = {
      active: "No active tasks. You're all caught up! 🎉",
      completed: 'No completed tasks yet. Get started!',
      all: 'No tasks yet. Create your first task! ✨',
    };

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📝</Text>
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          {emptyMessages[filter]}
        </Text>
        <Text
          style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}
        >
          Tap the button below to add a new task
        </Text>
      </View>
    );
  }, [filter, theme]);

  const getSyncStatusColor = () => {
    switch (status) {
      case 'syncing':
        return theme.colors.info;
      case 'succeeded':
        return theme.colors.success;
      case 'failed':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getSyncStatusText = () => {
    switch (status) {
      case 'syncing':
        return 'Syncing...';
      case 'succeeded':
        return 'Synced';
      case 'failed':
        return 'Sync Failed';
      default:
        return '';
    }
  };

  const getHeaderGradient = () => {
    const isDark = theme.colors.background === '#000000';
    return isDark
      ? ['rgba(10, 132, 255, 0.15)', 'rgba(28, 28, 30, 0.95)']
      : ['rgba(0, 122, 255, 0.08)', 'rgba(255, 255, 255, 0.95)'];
  };

  const handleFabPressIn = () => {
    Animated.spring(fabScale, {
      toValue: 0.9,
      useNativeDriver: true,
      friction: 6,
    }).start();
  };

  const handleFabPressOut = () => {
    Animated.spring(fabScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  };

  return (
    <ThemedStatusBar>
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Animated.View style={{ opacity: headerOpacity }}>
          <LinearGradient
            colors={getHeaderGradient()}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerTop}>
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                My Tasks
              </Text>
              {showSyncBadge && (
                <View style={styles.syncBadge}>
                  <View
                    style={[
                      styles.syncDot,
                      { backgroundColor: getSyncStatusColor() },
                    ]}
                  />
                  <Text
                    style={[styles.syncText, { color: getSyncStatusColor() }]}
                  >
                    {getSyncStatusText()}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.filterContainer}>
              {(['active', 'completed', 'all'] as const).map(f => (
                <FilterPill
                  key={f}
                  label={f.charAt(0).toUpperCase() + f.slice(1)}
                  count={getFilterCounts[f]}
                  isActive={filter === f}
                  onPress={() => handleFilterPress(f)}
                  theme={theme}
                />
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          removeClippedSubviews={Platform.OS === 'android'}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          windowSize={21}
          initialNumToRender={10}
          showsVerticalScrollIndicator={false}
        />

        <Animated.View
          style={[styles.fabContainer, { transform: [{ scale: fabScale }] }]}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('AddTask')}
            onPressIn={handleFabPressIn}
            onPressOut={handleFabPressOut}
            activeOpacity={1}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fab}
            >
              <Text style={styles.fabText}>+</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ThemedStatusBar>
  );
};

// FilterPill Component
interface FilterPillProps {
  label: string;
  count: number;
  isActive: boolean;
  onPress: () => void;
  theme: any;
}

const FilterPill: React.FC<FilterPillProps> = React.memo(
  ({ label, count, isActive, onPress, theme }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
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

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          {isActive ? (
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.filterButton}
            >
              <Text style={styles.activeFilterText}>{label}</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{count}</Text>
              </View>
            </LinearGradient>
          ) : (
            <View
              style={[
                styles.filterButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.borderLight,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {label}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: theme.colors.borderLight },
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {count}
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  syncText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 8,
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  activeFilterText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: '#FFFFFF',
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 80,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.7,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 100, // Positioned above floating tab bar
    right: 24,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2,
  },
});
