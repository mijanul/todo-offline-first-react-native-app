import Realm, { BSON } from 'realm';

export class TaskSchema extends Realm.Object<TaskSchema> {
  _id!: BSON.ObjectId;
  id!: string;
  userId!: string;
  title!: string;
  description?: string;
  completed!: boolean;
  createdAt!: number;
  updatedAt!: number;
  dueDate?: number;
  reminderTime?: number;
  synced!: boolean;
  isDeleted!: boolean;

  static schema: Realm.ObjectSchema = {
    name: 'Task',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      id: 'string',
      userId: 'string',
      title: 'string',
      description: 'string?',
      completed: { type: 'bool', default: false },
      createdAt: 'int',
      updatedAt: 'int',
      dueDate: 'int?',
      reminderTime: 'int?',
      synced: { type: 'bool', default: false },
      isDeleted: { type: 'bool', default: false },
    },
  };
}

export const realmConfig: Realm.Configuration = {
  schema: [TaskSchema],
  schemaVersion: 2,
  onMigration: (oldRealm: Realm, newRealm: Realm) => {
    // Handle migration from version 1 to 2 (adding isDeleted field)
    if (oldRealm.schemaVersion < 2) {
      const oldObjects = oldRealm.objects('Task');
      const newObjects = newRealm.objects('Task');

      for (let i = 0; i < oldObjects.length; i++) {
        newObjects[i].isDeleted = false;
      }
    }
  },
};
