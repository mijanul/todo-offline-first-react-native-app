import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform } from 'react-native';
import { TabParamList } from '../types';
import { TaskListScreen } from '../features/tasks/TaskListScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { useTheme } from '../theme/ThemeContext';

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    // @ts-expect-error - React Navigation v7 strict typing issue
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          borderTopWidth: 0.5,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 12,
          height: Platform.OS === 'ios' ? 88 : 68,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
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

// Modern Task Icon (Checkmark in circle)
const TaskIcon: React.FC<{ color: string; focused: boolean }> = ({
  color,
  focused,
}) => {
  return (
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: focused ? color + '20' : 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: color,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 6,
            height: 10,
            borderRightWidth: 2,
            borderBottomWidth: 2,
            borderColor: color,
            transform: [{ rotate: '45deg' }, { translateY: -1 }],
          }}
        />
      </View>
    </View>
  );
};

// Modern Settings Icon (Gear)
const SettingsIcon: React.FC<{ color: string; focused: boolean }> = ({
  color,
  focused,
}) => {
  return (
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: focused ? color + '20' : 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: color,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: color,
          }}
        />
      </View>
      {/* Gear teeth */}
      {[0, 90, 180, 270].map((angle, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            width: 2,
            height: 4,
            backgroundColor: color,
            transform: [
              { rotate: `${angle}deg` },
              { translateY: angle === 0 || angle === 180 ? -10 : 0 },
              {
                translateX:
                  angle === 90 || angle === 270 ? (angle === 90 ? 10 : -10) : 0,
              },
            ],
          }}
        />
      ))}
    </View>
  );
};
