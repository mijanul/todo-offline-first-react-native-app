import React, { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAppDispatch } from '../store/hooks';
import { setNetworkState } from '../store/slices/networkSlice';

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Get initial network state
    NetInfo.fetch().then(state => {
      dispatch(
        setNetworkState({
          isConnected: state.isConnected ?? false,
          type: state.type,
          isInternetReachable: state.isInternetReachable ?? null,
        }),
      );
    });

    // Subscribe to network state updates
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

  return <>{children}</>;
};
