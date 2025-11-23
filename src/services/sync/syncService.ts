import NetInfo from '@react-native-community/netinfo';
import type { NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { realmService } from '../database/realmService';
import { firebaseService } from '../firebase/firebaseService';

const LAST_SYNC_KEY = '@last_sync_time';

class SyncService {
  private isSyncing = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  async startAutoSync(userId: string): Promise<void> {
    // Sync every 5 minutes
    this.syncInterval = setInterval(() => {
      this.syncTasks(userId);
    }, 5 * 60 * 1000);

    // Also sync on network state change
    NetInfo.addEventListener((state: NetInfoState) => {
      if (state.isConnected && state.isInternetReachable) {
        this.syncTasks(userId);
      }
    });

    // Initial sync
    await this.syncTasks(userId);
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncTasks(userId: string): Promise<void> {
    if (this.isSyncing) return;

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected || !netInfo.isInternetReachable) {
      console.log('No internet connection, skipping sync');
      return;
    }

    this.isSyncing = true;

    try {
      // 1. Push local unsynced tasks to Firestore
      await this.pushLocalChanges(userId);

      // 2. Pull tasks from Firestore
      await this.pullRemoteChanges(userId);

      // 3. Update last sync time
      await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async pushLocalChanges(userId: string): Promise<void> {
    const unsyncedTasks = await realmService.getUnsyncedTasks(userId);

    for (const task of unsyncedTasks) {
      try {
        await firebaseService.syncTaskToFirestore(task);
        await realmService.markTaskAsSynced(task.id);
      } catch (error) {
        console.error(`Failed to sync task ${task.id}:`, error);
      }
    }
  }

  private async pullRemoteChanges(userId: string): Promise<void> {
    try {
      const remoteTasks = await firebaseService.fetchTasksFromFirestore();
      const localTasks = await realmService.getAllTasks(userId);

      // Create a map of local tasks for quick lookup
      const localTasksMap = new Map(localTasks.map(t => [t.id, t]));

      for (const remoteTask of remoteTasks) {
        const localTask = localTasksMap.get(remoteTask.id);

        if (!localTask) {
          // Task exists remotely but not locally - create it
          await realmService.createTask({
            userId: remoteTask.userId,
            title: remoteTask.title,
            description: remoteTask.description,
            completed: remoteTask.completed,
            dueDate: remoteTask.dueDate,
            reminderTime: remoteTask.reminderTime,
          });
        } else if (
          remoteTask.updatedAt > localTask.updatedAt &&
          localTask.synced
        ) {
          // Remote task is newer and local is synced - update local
          await realmService.updateTask(localTask.id, {
            title: remoteTask.title,
            description: remoteTask.description,
            completed: remoteTask.completed,
            dueDate: remoteTask.dueDate,
            reminderTime: remoteTask.reminderTime,
            updatedAt: remoteTask.updatedAt,
          });
          await realmService.markTaskAsSynced(localTask.id);
        }
      }
    } catch (error) {
      console.error('Failed to pull remote changes:', error);
    }
  }

  async getLastSyncTime(): Promise<number | null> {
    const time = await AsyncStorage.getItem(LAST_SYNC_KEY);
    return time ? parseInt(time, 10) : null;
  }

  async getPendingChangesCount(userId: string): Promise<number> {
    const unsyncedTasks = await realmService.getUnsyncedTasks(userId);
    return unsyncedTasks.length;
  }
}

export const syncService = new SyncService();
