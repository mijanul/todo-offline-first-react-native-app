import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { realmService } from '../database/realmService';
import { firebaseService } from '../firebase/firebaseService';
import { Task } from '../../types';
import { store } from '../../store';
import {
  setSyncStatus,
  setLastSyncedAt,
  setSyncError,
} from '../../store/slices/syncSlice';

class SyncService {
  private isConnected: boolean = false;
  private unsubscribeNetInfo: (() => void) | null = null;
  private unsubscribeFirestore: (() => void) | null = null;
  private isSyncing: boolean = false;

  private unsubscribeAuth: (() => void) | null = null;
  private unsubscribeRealm: (() => void) | null = null;

  constructor() {}

  async initialize() {
    this.unsubscribeNetInfo = NetInfo.addEventListener(
      (state: NetInfoState) => {
        this.isConnected = state.isConnected ?? false;
        if (this.isConnected) {
          this.syncLocalToRemote();
        }
      },
    );

    this.unsubscribeAuth = firebaseService.onAuthStateChanged(user => {
      if (user) {
        this.startSync();
      } else {
        this.stopSync();
      }
    });

    this.unsubscribeRealm = await realmService.addChangeListener(() => {
      if (this.isConnected) {
        this.syncLocalToRemote();
      }
    });
  }

  async startSync() {
    const user = firebaseService.getCurrentUser();
    if (!user) return;

    // Initial sync
    await this.syncLocalToRemote();

    // Listen for remote changes
    if (!this.unsubscribeFirestore) {
      this.unsubscribeFirestore = firebaseService.listenToTasks(
        tasks => {
          this.handleRemoteTasksUpdate(tasks);
        },
        error => {
          console.error('Firestore sync error:', error);
        },
      );
    }
  }

  stopSync() {
    if (this.unsubscribeFirestore) {
      this.unsubscribeFirestore();
      this.unsubscribeFirestore = null;
    }
  }

  cleanup() {
    this.stopSync();
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
      this.unsubscribeNetInfo = null;
    }
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
      this.unsubscribeAuth = null;
    }
    if (this.unsubscribeRealm) {
      this.unsubscribeRealm();
      this.unsubscribeRealm = null;
    }
  }

  async syncLocalToRemote() {
    if (!this.isConnected || this.isSyncing) return;

    const user = firebaseService.getCurrentUser();
    if (!user) return;

    try {
      this.isSyncing = true;
      store.dispatch(setSyncStatus('syncing'));

      const unsyncedTasks = await realmService.getUnsyncedTasks(user.uid);
      const deletedTasks = await realmService.getDeletedTasks(user.uid);

      console.log(
        `📤 Starting sync: ${unsyncedTasks.length} unsynced tasks, ${deletedTasks.length} deleted tasks`,
      );

      // Sync regular tasks (including updates)
      for (const task of unsyncedTasks) {
        if (!task.isDeleted) {
          await firebaseService.syncTaskToFirestore(task);
          await realmService.markTaskAsSynced(task.id);
          console.log(`✓ Synced task ${task.id}`);
        }
      }

      // Sync deleted tasks
      for (const task of deletedTasks) {
        await firebaseService.deleteTaskFromFirestore(task.id);
        await realmService.permanentlyDeleteTask(task.id, user.uid);
        console.log(`✓ Permanently deleted task ${task.id}`);
      }

      if (unsyncedTasks.length > 0 || deletedTasks.length > 0) {
        console.log('🎉 All tasks synced successfully!');
      }

      store.dispatch(setSyncStatus('succeeded'));
      store.dispatch(setLastSyncedAt(Date.now()));
    } catch (error) {
      console.error('❌ Error syncing local to remote:', error);
      store.dispatch(setSyncStatus('failed'));
      store.dispatch(
        setSyncError(error instanceof Error ? error.message : 'Unknown error'),
      );
    } finally {
      this.isSyncing = false;
      // Reset status to idle after a delay if successful
      if (store.getState().sync.status === 'succeeded') {
        setTimeout(() => {
          store.dispatch(setSyncStatus('idle'));
        }, 3000);
      }
    }
  }

  private async handleRemoteTasksUpdate(remoteTasks: Task[]) {
    try {
      store.dispatch(setSyncStatus('syncing'));
      for (const remoteTask of remoteTasks) {
        await realmService.saveRemoteTask(remoteTask);
      }
      store.dispatch(setSyncStatus('succeeded'));
      store.dispatch(setLastSyncedAt(Date.now()));

      setTimeout(() => {
        store.dispatch(setSyncStatus('idle'));
      }, 3000);
    } catch (error) {
      console.error('Error handling remote updates:', error);
      store.dispatch(setSyncStatus('failed'));
      store.dispatch(
        setSyncError(error instanceof Error ? error.message : 'Unknown error'),
      );
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    const user = firebaseService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    console.log(`🗑️ Deleting task ${taskId}...`);

    try {
      // Soft delete locally (mark as deleted)
      await realmService.deleteTask(taskId, user.uid);
      console.log(`✅ Task ${taskId} marked as deleted locally`);

      // If online, sync the deletion immediately
      if (this.isConnected) {
        await this.syncLocalToRemote();
      } else {
        console.log(`⚠️ Offline - deletion will sync when online`);
      }
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      throw error;
    }
  }
}

export const syncService = new SyncService();
