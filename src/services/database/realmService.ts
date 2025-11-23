import Realm, { BSON } from 'realm';
import { TaskSchema, realmConfig } from './schema';
import { Task } from '../../types';

class RealmService {
  private realm: Realm | null = null;

  async init(): Promise<void> {
    if (!this.realm) {
      this.realm = await Realm.open(realmConfig);
    }
  }

  async getAllTasks(userId: string): Promise<Task[]> {
    await this.init();
    const tasks = this.realm!.objects<TaskSchema>('Task').filtered(
      'userId == $0',
      userId,
    );
    return Array.from(tasks).map(this.taskSchemaToTask);
  }

  async getTaskById(id: string): Promise<Task | null> {
    await this.init();
    const task = this.realm!.objects<TaskSchema>('Task').filtered(
      'id == $0',
      id,
    )[0];
    return task ? this.taskSchemaToTask(task) : null;
  }

  async createTask(
    task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'synced'>,
  ): Promise<Task> {
    await this.init();
    const now = Date.now();
    const id = new BSON.ObjectId().toString();

    this.realm!.write(() => {
      this.realm!.create('Task', {
        _id: new BSON.ObjectId(),
        id,
        ...task,
        createdAt: now,
        updatedAt: now,
        synced: false,
      });
    });

    return (await this.getTaskById(id))!;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    await this.init();
    const task = this.realm!.objects<TaskSchema>('Task').filtered(
      'id == $0',
      id,
    )[0];

    if (!task) {
      return null;
    }

    this.realm!.write(() => {
      Object.assign(task, {
        ...updates,
        updatedAt: Date.now(),
        synced: false,
      });
    });

    return this.taskSchemaToTask(task);
  }

  async deleteTask(id: string): Promise<boolean> {
    await this.init();
    const task = this.realm!.objects<TaskSchema>('Task').filtered(
      'id == $0',
      id,
    )[0];

    if (!task) {
      return false;
    }

    this.realm!.write(() => {
      this.realm!.delete(task);
    });

    return true;
  }

  async getUnsyncedTasks(userId: string): Promise<Task[]> {
    await this.init();
    const tasks = this.realm!.objects<TaskSchema>('Task').filtered(
      'userId == $0 AND synced == false',
      userId,
    );
    return Array.from(tasks).map(this.taskSchemaToTask);
  }

  async markTaskAsSynced(id: string): Promise<void> {
    await this.init();
    const task = this.realm!.objects<TaskSchema>('Task').filtered(
      'id == $0',
      id,
    )[0];

    if (task) {
      this.realm!.write(() => {
        task.synced = true;
      });
    }
  }

  async clearAllTasks(): Promise<void> {
    await this.init();
    this.realm!.write(() => {
      const allTasks = this.realm!.objects('Task');
      this.realm!.delete(allTasks);
    });
  }

  private taskSchemaToTask(taskSchema: TaskSchema): Task {
    return {
      id: taskSchema.id,
      userId: taskSchema.userId,
      title: taskSchema.title,
      description: taskSchema.description,
      completed: taskSchema.completed,
      createdAt: taskSchema.createdAt,
      updatedAt: taskSchema.updatedAt,
      dueDate: taskSchema.dueDate,
      reminderTime: taskSchema.reminderTime,
      synced: taskSchema.synced,
    };
  }

  close(): void {
    if (this.realm && !this.realm.isClosed) {
      this.realm.close();
      this.realm = null;
    }
  }
}

export const realmService = new RealmService();
