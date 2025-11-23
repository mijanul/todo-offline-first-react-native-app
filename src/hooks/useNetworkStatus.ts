import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setNetworkState } from '../store/slices/networkSlice';
import type { RootState } from '../store';

export const useNetworkStatus = () => {
  const dispatch = useAppDispatch();
  const networkState = useAppSelector((state: RootState) => state.network);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      dispatch(
        setNetworkState({
          isConnected: state.isConnected ?? false,
          type: state.type,
          isInternetReachable: state.isInternetReachable ?? null,
        }),
      );
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return networkState;
};
