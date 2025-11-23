import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NetworkState {
  isConnected: boolean;
  type: string | null;
  isInternetReachable: boolean | null;
}

const initialState: NetworkState = {
  isConnected: true, // Assume connected initially
  type: null,
  isInternetReachable: null,
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setNetworkState: (
      state,
      action: PayloadAction<{
        isConnected: boolean;
        type: string | null;
        isInternetReachable: boolean | null;
      }>,
    ) => {
      state.isConnected = action.payload.isConnected;
      state.type = action.payload.type;
      state.isInternetReachable = action.payload.isInternetReachable;
    },
  },
});

export const { setNetworkState } = networkSlice.actions;

export default networkSlice.reducer;
