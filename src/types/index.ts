export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
  dueDate?: number;
  reminderTime?: number;
  synced: boolean;
  isDeleted: boolean;
}

export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  filter: 'all' | 'active' | 'completed';
}

export interface ThemeState {
  mode: 'light' | 'dark';
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingChanges: number;
}

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type TabParamList = {
  Tasks: undefined;
  Settings: undefined;
  NotificationTest: undefined;
};

export type AppStackParamList = {
  Tabs: undefined;
  TaskDetail: { taskId: string };
  AddTask: undefined;
  EditTask: { taskId: string };
  NotificationTest: undefined;
};
