export const lightTheme = {
  colors: {
    // Primary colors
    primary: '#007AFF',
    primaryLight: '#5AC8FA',
    primaryDark: '#0051D5',

    // Background colors
    background: '#F5F5F7',
    backgroundSecondary: '#FFFFFF',

    // Surface colors
    card: '#FFFFFF',
    surface: '#FAFAFA',
    surfaceElevated: '#FFFFFF',

    // Text colors
    text: '#1C1C1E',
    textSecondary: '#8E8E93',
    textTertiary: '#C7C7CC',

    // Input colors
    inputBackground: '#FFFFFF',
    inputBorder: '#D1D1D6',
    inputFocusBorder: '#007AFF',

    // Border colors
    border: '#C6C6C8',
    borderLight: '#E5E5EA',

    // Status colors
    notification: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#5AC8FA',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.4)',

    // Shadow
    shadow: '#000000',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    round: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  shadow: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

export const darkTheme = {
  colors: {
    // Primary colors
    primary: '#0A84FF',
    primaryLight: '#64D2FF',
    primaryDark: '#0066CC',

    // Background colors
    background: '#000000',
    backgroundSecondary: '#1C1C1E',

    // Surface colors
    card: '#1C1C1E',
    surface: '#2C2C2E',
    surfaceElevated: '#3A3A3C',

    // Text colors
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    textTertiary: '#48484A',

    // Input colors
    inputBackground: '#1C1C1E',
    inputBorder: '#38383A',
    inputFocusBorder: '#0A84FF',

    // Border colors
    border: '#38383A',
    borderLight: '#48484A',

    // Status colors
    notification: '#FF453A',
    success: '#32D74B',
    warning: '#FF9F0A',
    error: '#FF453A',
    info: '#64D2FF',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.6)',

    // Shadow
    shadow: '#000000',
  },
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  fontSize: lightTheme.fontSize,
  fontWeight: lightTheme.fontWeight,
  shadow: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

export type Theme = typeof lightTheme;
