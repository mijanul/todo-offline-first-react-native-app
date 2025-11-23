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
      'userId == $0 AND isDeleted == false',
      userId,
    );
    return Array.from(tasks).map(this.taskSchemaToTask);
  }

  async getTaskById(id: string, userId: string): Promise<Task | null> {
    await this.init();
    const task = this.realm!.objects<TaskSchema>('Task').filtered(
      'id == $0 AND userId == $1 AND isDeleted == false',
      id,
      userId,
    )[0];
    return task ? this.taskSchemaToTask(task) : null;
  }

  async createTask(
    task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'synced' | 'isDeleted'>,
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
        isDeleted: false,
      });
    });

    return (await this.getTaskById(id, task.userId))!;
  }

  async updateTask(
    id: string,
    userId: string,
    updates: Partial<Task>,
  ): Promise<Task | null> {
    await this.init();
    const task = this.realm!.objects<TaskSchema>('Task').filtered(
      'id == $0 AND userId == $1',
      id,
      userId,
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

  async deleteTask(id: string, userId: string): Promise<boolean> {
    await this.init();
    const task = this.realm!.objects<TaskSchema>('Task').filtered(
      'id == $0 AND userId == $1',
      id,
      userId,
    )[0];

    if (!task) {
      return false;
    }

    // Soft delete: mark as deleted instead of physically removing
    this.realm!.write(() => {
      task.isDeleted = true;
      task.synced = false; // Mark as unsynced so deletion gets synced
      task.updatedAt = Date.now();
    });

    return true;
  }

  async permanentlyDeleteTask(id: string, userId: string): Promise<boolean> {
    await this.init();
    const task = this.realm!.objects<TaskSchema>('Task').filtered(
      'id == $0 AND userId == $1',
      id,
      userId,
    )[0];

    if (!task) {
      return false;
    }

    // Hard delete: physically remove from database
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

  async getDeletedTasks(userId: string): Promise<Task[]> {
    await this.init();
    const tasks = this.realm!.objects<TaskSchema>('Task').filtered(
      'userId == $0 AND isDeleted == true AND synced == false',
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
      isDeleted: taskSchema.isDeleted,
    };
  }

  async saveRemoteTask(task: Task): Promise<void> {
    await this.init();
    const existingTask = this.realm!.objects<TaskSchema>('Task').filtered(
      'id == $0 AND userId == $1',
      task.id,
      task.userId,
    )[0];

    this.realm!.write(() => {
      if (existingTask) {
        existingTask.title = task.title;
        existingTask.description = task.description;
        existingTask.completed = task.completed;
        existingTask.createdAt = task.createdAt;
        existingTask.updatedAt = task.updatedAt;
        existingTask.dueDate = task.dueDate;
        existingTask.reminderTime = task.reminderTime;
        existingTask.isDeleted = task.isDeleted;
        existingTask.synced = true;
      } else {
        this.realm!.create('Task', {
          _id: new BSON.ObjectId(),
          ...task,
          synced: true,
        });
      }
    });
  }

  async addChangeListener(callback: () => void): Promise<() => void> {
    await this.init();
    const tasks = this.realm!.objects<TaskSchema>('Task');

    const listener = () => {
      callback();
    };

    tasks.addListener(listener);

    return () => {
      tasks.removeListener(listener);
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
