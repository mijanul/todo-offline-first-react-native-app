import React from 'react';
import { StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface ThemedStatusBarProps {
  children?: React.ReactNode;
}

const ThemedStatusBar: React.FC<ThemedStatusBarProps> = ({ children }) => {
  const { isDark, theme } = useTheme();

  if (children) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
      >
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        {children}
      </SafeAreaView>
    );
  }

  return (
    <StatusBar
      barStyle={isDark ? 'light-content' : 'dark-content'}
      backgroundColor={theme.colors.background}
    />
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});

export default ThemedStatusBar;
