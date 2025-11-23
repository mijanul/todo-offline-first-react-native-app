import React, { Suspense, lazy } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { AuthStackParamList } from '../types';

// Lazy load screens
const LoginScreen = lazy(() =>
  import('../features/auth/LoginScreen').then(module => ({
    default: module.LoginScreen,
  })),
);
const SignUpScreen = lazy(() =>
  import('../features/auth/SignUpScreen').then(module => ({
    default: module.SignUpScreen,
  })),
);

const Stack = createNativeStackNavigator<AuthStackParamList>();

const LoadingFallback = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" />
  </View>
);

export const AuthNavigator: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      {/* @ts-expect-error - React Navigation v7 strict typing issue */}
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
      </Stack.Navigator>
    </Suspense>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
