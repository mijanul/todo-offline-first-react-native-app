import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onPress }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          borderColor: checked ? theme.colors.primary : theme.colors.border,
          backgroundColor: checked ? theme.colors.primary : 'transparent',
        },
      ]}
      onPress={onPress}
    >
      {checked && <View style={styles.checkmark} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    width: 12,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
});
