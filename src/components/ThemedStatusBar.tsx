import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

interface ThemedStatusBarProps {
  children?: React.ReactNode;
}

const ThemedStatusBar: React.FC<ThemedStatusBarProps> = ({ children }) => {
  const { isDark, theme } = useTheme();

  if (children) {
    return (
      <>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
          translucent={false}
        />
        <SafeAreaView
          style={[
            styles.safeArea,
            { backgroundColor: theme.colors.background },
          ]}
          edges={['top', 'left', 'right']}
        >
          {children}
        </SafeAreaView>
      </>
    );
  }

  return (
    <StatusBar
      barStyle={isDark ? 'light-content' : 'dark-content'}
      backgroundColor={theme.colors.background}
      translucent={false}
    />
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});

export default ThemedStatusBar;
