import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
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
    pulse.start();

    return () => pulse.stop();
  }, []);

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isDark ? 1 : 0,
      duration: 500,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();
  }, [isDark]);

  const handlePress = () => {
    // Press feedback animation
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

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: Animated.multiply(scale, pulseAnim) }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.button,
          {
            backgroundColor: isDark
              ? 'rgba(30, 30, 30, 0.9)'
              : 'rgba(255, 255, 255, 0.9)',
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.2)'
              : 'rgba(0, 0, 0, 0.1)',
            shadowColor: isDark ? '#FFF' : '#FFD700',
            shadowOpacity: isDark ? 0.3 : 0.6,
          },
        ]}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          {isDark ? <LightBulbOff /> : <LightBulbOn />}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const LightBulbOn = () => (
  <View style={styles.iconWrapper}>
    <View style={[styles.bulbGlass, { backgroundColor: '#FFD700' }]} />

    <View style={styles.bulbBase} />

    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
      <View
        key={index}
        style={[
          styles.ray,
          { transform: [{ rotate: `${angle}deg` }, { translateY: -14 }] },
        ]}
      />
    ))}

    <View style={styles.bulbReflection} />
  </View>
);

const LightBulbOff = () => (
  <View style={styles.iconWrapper}>
    <View
      style={[
        styles.bulbGlass,
        { backgroundColor: '#555', borderWidth: 1, borderColor: '#777' },
      ]}
    />

    <View style={styles.bulbBase} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 30,
    right: 20,
    zIndex: 100,
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
  iconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulbGlass: {
    width: 16,
    height: 16,
    borderRadius: 8,
    zIndex: 2,
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
  ray: {
    position: 'absolute',
    width: 2,
    height: 4,
    backgroundColor: '#FFD700',
    borderRadius: 1,
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
});
