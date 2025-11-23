import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Keyboard,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const positionAnim = useRef(new Animated.Value(0)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (!keyboardVisible) {
      pulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      pulseRef.current.start();
    } else {
      if (pulseRef.current) {
        pulseRef.current.stop();
        pulseAnim.setValue(1);
      }
    }
    return () => {
      if (pulseRef.current) pulseRef.current.stop();
    };
  }, [pulseAnim, keyboardVisible]);

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isDark ? 1 : 0,
      duration: 500,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();
  }, [isDark, rotateAnim]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardShowListener = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
      const { width } = Dimensions.get('window');
      const targetX = 90 - width;
      Animated.timing(positionAnim, {
        toValue: targetX,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    });

    const keyboardHideListener = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
      Animated.timing(positionAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, [positionAnim]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    toggleTheme();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  if (keyboardVisible) return null;
  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: Animated.multiply(scale, pulseAnim) },
            { translateX: positionAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        style={[styles.button, isDark ? styles.buttonDark : styles.buttonLight]}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          {isDark ? <LightBulbOff /> : <LightBulbOn />}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

type BulbProps = { small?: boolean };

const LightBulbOn = ({ small }: BulbProps) => (
  <View style={[styles.iconWrapper, small && styles.iconWrapperSmall]}>
    <View
      style={[
        styles.bulbGlass,
        styles.bulbGlassOn,
        small && styles.bulbGlassSmall,
      ]}
    />
    <View style={[styles.bulbBase, small && styles.bulbBaseSmall]} />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
      <View
        key={index}
        style={[
          styles.ray,
          {
            transform: [
              { rotate: `${angle}deg` },
              { translateY: small ? -8 : -14 },
            ],
          },
          small && styles.raySmall,
        ]}
      />
    ))}
    <View
      style={[styles.bulbReflection, small && styles.bulbReflectionSmall]}
    />
  </View>
);

const LightBulbOff = ({ small }: BulbProps) => (
  <View style={[styles.iconWrapper, small && styles.iconWrapperSmall]}>
    <View
      style={[
        styles.bulbGlass,
        styles.bulbGlassOff,
        small && styles.bulbGlassSmall,
      ]}
    />
    <View style={[styles.bulbBase, small && styles.bulbBaseSmall]} />
  </View>
);

const styles = StyleSheet.create({
  buttonDark: {
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#FFF',
    shadowOpacity: 0.3,
  },
  buttonLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#FFD700',
    shadowOpacity: 0.6,
  },
  bulbGlassOn: {
    backgroundColor: '#FFD700',
  },
  bulbGlassOff: {
    backgroundColor: '#555',
    borderWidth: 1,
    borderColor: '#777',
  },
  container: {
    position: 'absolute',
    top: 30,
    right: 20,
    zIndex: 100,
  },
  containerLeft: {
    top: 10,
    right: 5,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
  },
  buttonSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    shadowRadius: 6,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapperSmall: {
    width: 16,
    height: 16,
  },
  bulbGlass: {
    width: 16,
    height: 16,
    borderRadius: 8,
    zIndex: 2,
  },
  bulbGlassSmall: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  bulbBase: {
    width: 10,
    height: 6,
    backgroundColor: '#888',
    marginTop: -2,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    zIndex: 1,
  },
  bulbBaseSmall: {
    width: 6,
    height: 4,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  ray: {
    position: 'absolute',
    width: 2,
    height: 4,
    backgroundColor: '#FFD700',
    borderRadius: 1,
  },
  raySmall: {
    width: 1,
    height: 2,
    borderRadius: 0.5,
  },
  bulbReflection: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
    zIndex: 3,
  },
  bulbReflectionSmall: {
    top: 3,
    right: 4,
    width: 2,
    height: 2,
    borderRadius: 1,
  },
});
