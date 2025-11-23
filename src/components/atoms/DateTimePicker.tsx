import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../theme/ThemeContext';

interface DateTimePickerProps {
  label: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  error?: string;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  required?: boolean;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  label,
  value,
  onChange,
  error,
  mode = 'datetime',
  minimumDate = new Date(),
  required = false,
}) => {
  const { theme } = useTheme();
  const [show, setShow] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | undefined>(value);

  // Cleanup on unmount to prevent dismiss errors
  useEffect(() => {
    return () => {
      setShow(false);
      setShowTimePicker(false);
    };
  }, []);

  const handleConfirm = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (event.type === 'set' && selectedDate) {
        // If mode is datetime and we just selected a date, show time picker next
        if (mode === 'datetime' && !showTimePicker) {
          setTempDate(selectedDate);
          setShowTimePicker(true);
        } else {
          onChange(selectedDate);
          setShowTimePicker(false);
        }
      } else {
        setShowTimePicker(false);
      }
    } else {
      setTempDate(selectedDate);
    }
  };

  const handleTimeConfirm = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (event.type === 'set' && selectedTime && tempDate) {
      // Combine the date from tempDate with the time from selectedTime
      const combined = new Date(tempDate);
      combined.setHours(selectedTime.getHours());
      combined.setMinutes(selectedTime.getMinutes());
      onChange(combined);
    }
  };

  const handleIOSConfirm = () => {
    setShow(false);
    if (tempDate) {
      onChange(tempDate);
    }
  };

  const handleIOSCancel = () => {
    setShow(false);
    setTempDate(value);
  };

  const handleClear = () => {
    onChange(undefined);
  };

  const formatDateTime = (date?: Date): string => {
    if (!date) return 'Not set';

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    return date.toLocaleString('en-US', options);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.card,
              borderColor: error ? theme.colors.error : theme.colors.border,
            },
          ]}
          onPress={() => setShow(true)}
        >
          <Text
            style={[
              styles.inputText,
              {
                color: value ? theme.colors.text : theme.colors.textSecondary,
              },
            ]}
          >
            {formatDateTime(value)}
          </Text>
        </TouchableOpacity>
        {value && !required && (
          <TouchableOpacity
            style={[
              styles.clearButton,
              { backgroundColor: theme.colors.error },
            ]}
            onPress={handleClear}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}

      {show && Platform.OS === 'ios' && (
        <View
          style={[
            styles.iosPickerContainer,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <View style={styles.iosPickerHeader}>
            <TouchableOpacity onPress={handleIOSCancel}>
              <Text
                style={[
                  styles.iosButton,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleIOSConfirm}>
              <Text style={[styles.iosButton, { color: theme.colors.primary }]}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
          <RNDateTimePicker
            value={tempDate || minimumDate}
            mode={mode}
            display="spinner"
            onChange={handleConfirm}
            minimumDate={minimumDate}
          />
        </View>
      )}

      {show && Platform.OS === 'android' && (
        <RNDateTimePicker
          value={value || minimumDate}
          mode={mode === 'datetime' ? 'date' : mode}
          display="default"
          onChange={handleConfirm}
          minimumDate={minimumDate}
        />
      )}

      {showTimePicker && Platform.OS === 'android' && (
        <RNDateTimePicker
          value={tempDate || minimumDate}
          mode="time"
          display="default"
          onChange={handleTimeConfirm}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputText: {
    fontSize: 16,
  },
  clearButton: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  iosPickerContainer: {
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  iosButton: {
    fontSize: 16,
    fontWeight: '600',
  },
});
