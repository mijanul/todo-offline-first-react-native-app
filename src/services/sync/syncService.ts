import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { realmService } from '../database/realmService';
import { firebaseService } from '../firebase/firebaseService';
import { Task } from '../../types';

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
      const unsyncedTasks = await realmService.getUnsyncedTasks(user.uid);

      console.log(
        `📤 Starting sync: ${unsyncedTasks.length} unsynced tasks found`,
      );

      for (const task of unsyncedTasks) {
        await firebaseService.syncTaskToFirestore(task);
        await realmService.markTaskAsSynced(task.id);
        console.log(`✓ Marked task ${task.id} as synced locally`);
      }

      if (unsyncedTasks.length > 0) {
        console.log('🎉 All tasks synced successfully!');
      }
    } catch (error) {
      console.error('❌ Error syncing local to remote:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async handleRemoteTasksUpdate(remoteTasks: Task[]) {
    for (const remoteTask of remoteTasks) {
      await realmService.saveRemoteTask(remoteTask);
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    const user = firebaseService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    console.log(`🗑️ Deleting task ${taskId} from Firestore...`);

    try {
      // Delete from Firestore first
      if (this.isConnected) {
        await firebaseService.deleteTaskFromFirestore(taskId);
        console.log(`✅ Task ${taskId} deleted from Firestore`);
      } else {
        console.log(`⚠️ Offline - task will be deleted locally only`);
      }

      // Then delete from local database
      await realmService.deleteTask(taskId, user.uid);
      console.log(`✅ Task ${taskId} deleted from local database`);
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      throw error;
    }
  }
}

export const syncService = new SyncService();
