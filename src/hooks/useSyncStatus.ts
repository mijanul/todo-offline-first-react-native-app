import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const useSyncStatus = () => {
  const { status, lastSyncedAt, error } = useSelector(
    (state: RootState) => state.sync,
  );

  return {
    status,
    lastSyncedAt,
    error,
    isSyncing: status === 'syncing',
    isSynced: status === 'succeeded',
    isError: status === 'failed',
  };
};
