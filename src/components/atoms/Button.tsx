import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'text';
  loading?: boolean;
  fullWidth?: boolean;
  gradientColors?: string[];
  icon?: React.ReactNode;
  textColor?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  gradientColors,
  icon,
  textColor,
  ...props
}) => {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.border;
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.card;
      case 'danger':
        return theme.colors.error;
      case 'outline':
      case 'text':
        return 'transparent';
      default:
        return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) {
      if (gradientColors) return '#FFFFFF';
      return theme.colors.textSecondary;
    }
    if (textColor) return textColor;
    if (variant === 'secondary' || variant === 'outline')
      return theme.colors.text;
    if (variant === 'text') return theme.colors.primary;
    return '#FFFFFF';
  };

  const buttonStyle: ViewStyle = {
    backgroundColor: !gradientColors ? getBackgroundColor() : undefined,
    width: fullWidth ? '100%' : undefined,
    borderColor: variant === 'outline' ? theme.colors.border : undefined,
    borderWidth: variant === 'outline' ? 1 : 0,
  };

  const content = (
    <View style={styles.contentContainer}>
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
        </>
      )}
    </View>
  );

  if (gradientColors && variant === 'primary') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabled || loading}
        style={[
          styles.container,
          fullWidth && styles.fullWidth,
          style,
          { opacity: disabled ? 0.8 : 1 },
        ]}
        {...props}
      >
        <LinearGradient
          colors={disabled ? ['#9CA3AF', '#4B5563'] : gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, styles.gradientButton]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.button, buttonStyle, style]}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientButton: {
    width: '100%',
  },
  fullWidth: {
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
