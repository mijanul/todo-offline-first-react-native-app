import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TasksState, Task } from '../../types';

const initialState: TasksState = {
  tasks: [],
  isLoading: false,
  error: null,
  filter: 'active',
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
      state.error = null;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
    },
    toggleTaskComplete: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find(t => t.id === action.payload);
      if (task) {
        task.completed = !task.completed;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setFilter: (
      state,
      action: PayloadAction<'all' | 'active' | 'completed'>,
    ) => {
      state.filter = action.payload;
    },
    clearTasks: state => {
      state.tasks = [];
      state.error = null;
      state.isLoading = false;
    },
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  removeTask,
  toggleTaskComplete,
  setLoading,
  setError,
  setFilter,
  clearTasks,
} = tasksSlice.actions;

export default tasksSlice.reducer;
