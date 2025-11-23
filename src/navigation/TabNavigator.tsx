import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform, Animated, StyleSheet } from 'react-native';
import { TabParamList } from '../types';
import { TaskListScreen } from '../features/tasks/TaskListScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { NotificationTestScreen } from '../features/notifications/NotificationTestScreen';
import { useTheme } from '../theme/ThemeContext';

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator: React.FC = () => {
  const { theme, isDark } = useTheme();

  return (
    // @ts-expect-error - React Navigation v7 strict typing issue
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 20 : 16,
          left: 20,
          right: 20,
          backgroundColor: isDark
            ? 'rgba(28, 28, 30, 0.85)'
            : 'rgba(255, 255, 255, 0.85)',
          borderRadius: 24,
          borderTopWidth: 0,
          paddingBottom: Platform.OS === 'ios' ? 20 : 12,
          paddingTop: 12,
          height: Platform.OS === 'ios' ? 88 : 72,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.4 : 0.15,
          shadowRadius: 16,
          elevation: 12,
          borderWidth: 1,
          borderColor: isDark
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 6,
          letterSpacing: 0.3,
        },
        tabBarBackground: () => (
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              borderRadius: 24,
              overflow: 'hidden',
              backgroundColor: isDark
                ? 'rgba(28, 28, 30, 0.85)'
                : 'rgba(255, 255, 255, 0.85)',
            }}
          />
        ),
      }}
    >
      <Tab.Screen
        name="Tasks"
        component={TaskListScreen}
        options={{
          tabBarLabel: 'Tasks',
          tabBarIcon: ({ color, focused }) => (
            <TaskIcon color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="NotificationTest"
        component={NotificationTestScreen}
        options={{
          tabBarLabel: 'Test',
          tabBarIcon: ({ color, focused }) => (
            <NotificationIcon color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <SettingsIcon color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Ultra Modern Animated Task Icon
const TaskIcon: React.FC<{ color: string; focused: boolean }> = ({
  color,
  focused,
}) => {
  const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0.9)).current;
  const rotateAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.1 : 1,
        useNativeDriver: true,
        friction: 5,
        tension: 100,
      }),
      Animated.spring(rotateAnim, {
        toValue: focused ? 1 : 0,
        useNativeDriver: true,
        friction: 5,
        tension: 100,
      }),
    ]).start();
  }, [focused]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }, { rotate: rotation }],
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: focused ? color + '20' : 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {focused && (
          <View
            style={{
              position: 'absolute',
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: color,
              opacity: 0.15,
            }}
          />
        )}
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            borderWidth: 2.5,
            borderColor: color,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: focused ? color + '10' : 'transparent',
          }}
        >
          <View
            style={{
              width: 7,
              height: 11,
              borderRightWidth: 2.5,
              borderBottomWidth: 2.5,
              borderColor: color,
              transform: [{ rotate: '45deg' }, { translateY: -1.5 }],
            }}
          />
        </View>
      </View>
    </Animated.View>
  );
};

// Ultra Modern Animated Notification Icon
const NotificationIcon: React.FC<{ color: string; focused: boolean }> = ({
  color,
  focused,
}) => {
  const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.1 : 1,
        useNativeDriver: true,
        friction: 5,
        tension: 100,
      }),
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: focused ? 15 : 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: focused ? -15 : 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [focused]);

  const rotation = rotateAnim.interpolate({
    inputRange: [-15, 15],
    outputRange: ['-15deg', '15deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }, { rotate: rotation }],
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: focused ? color + '20' : 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {focused && (
          <View
            style={{
              position: 'absolute',
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: color,
              opacity: 0.15,
            }}
          />
        )}
        <View
          style={{
            width: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Bell Body */}
          <View
            style={{
              width: 14,
              height: 14,
              borderTopLeftRadius: 7,
              borderTopRightRadius: 7,
              borderBottomLeftRadius: 2,
              borderBottomRightRadius: 2,
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderColor: color,
              marginBottom: 2,
            }}
          />
          {/* Bell Clapper */}
          <View
            style={{
              width: 4,
              height: 2,
              borderBottomLeftRadius: 2,
              borderBottomRightRadius: 2,
              backgroundColor: color,
            }}
          />
        </View>
      </View>
    </Animated.View>
  );
};

// Ultra Modern Animated Settings Icon
const SettingsIcon: React.FC<{ color: string; focused: boolean }> = ({
  color,
  focused,
}) => {
  const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.1 : 1,
        useNativeDriver: true,
        friction: 5,
        tension: 100,
      }),
      Animated.timing(rotateAnim, {
        toValue: focused ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: focused ? color + '20' : 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {focused && (
          <View
            style={{
              position: 'absolute',
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: color,
              opacity: 0.15,
            }}
          />
        )}
        <Animated.View
          style={{
            transform: [{ rotate: rotation }],
          }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              borderWidth: 2.5,
              borderColor: color,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: focused ? color + '10' : 'transparent',
            }}
          >
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 3.5,
                backgroundColor: color,
              }}
            />
          </View>
          {/* Gear teeth with modern design */}
          {[0, 60, 120, 180, 240, 300].map((angle, index) => (
            <View
              key={index}
              style={{
                position: 'absolute',
                width: 2.5,
                height: 5,
                backgroundColor: color,
                borderRadius: 1.25,
                transform: [{ rotate: `${angle}deg` }, { translateY: -11 }],
              }}
            />
          ))}
        </Animated.View>
      </View>
    </Animated.View>
  );
};
