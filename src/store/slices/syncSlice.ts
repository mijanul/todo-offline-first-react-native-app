import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SyncStatus = 'idle' | 'syncing' | 'succeeded' | 'failed';

interface SyncState {
  status: SyncStatus;
  lastSyncedAt: number | null;
  error: string | null;
}

const initialState: SyncState = {
  status: 'idle',
  lastSyncedAt: null,
  error: null,
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setSyncStatus: (state, action: PayloadAction<SyncStatus>) => {
      state.status = action.payload;
    },
    setLastSyncedAt: (state, action: PayloadAction<number>) => {
      state.lastSyncedAt = action.payload;
    },
    setSyncError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setSyncStatus, setLastSyncedAt, setSyncError } =
  syncSlice.actions;

export default syncSlice.reducer;
