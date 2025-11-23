import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setTheme } from '../store/slices/themeSlice';
import { lightTheme, darkTheme, Theme } from './theme';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(state => state.theme.mode);
  const systemColorScheme = useColorScheme();

  useEffect(() => {
    if (
      !themeMode &&
      systemColorScheme &&
      (systemColorScheme === 'light' || systemColorScheme === 'dark')
    ) {
      dispatch(setTheme(systemColorScheme));
    }
  }, [systemColorScheme, themeMode, dispatch]);

  const isDark = themeMode === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    dispatch(setTheme(isDark ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
