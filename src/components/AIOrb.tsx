import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, AccessibilityInfo } from 'react-native';
import { Colors } from '../constants/theme';

type OrbState = 'idle' | 'thinking' | 'responding';

type Props = {
  size?: number;
  state?: OrbState;
};

export function AIOrb({ size = 36, state = 'idle' }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.().then(setReduceMotion).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    let loop: Animated.CompositeAnimation | null = null;

    if (state === 'idle') {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.75, duration: 1000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ]),
      );
    } else if (state === 'thinking') {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.15, duration: 400, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
      );
    } else if (state === 'responding') {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.5, duration: 200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]),
        { iterations: 3 },
      );
    }

    loop?.start();
    return () => loop?.stop();
  }, [state, opacity, scale, reduceMotion]);

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: reduceMotion ? undefined : [{ scale }],
          opacity: reduceMotion ? 1 : opacity,
        },
      ]}
    >
      <View
        style={[
          styles.highlight,
          {
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: size * 0.2,
            top: size * 0.12,
            left: size * 0.15,
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  orb: {
    backgroundColor: Colors.primary,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});
