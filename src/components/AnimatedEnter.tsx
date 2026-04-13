import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  AccessibilityInfo,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  duration?: number;
  translateYFrom?: number;
};

// Fade + slide-up entrance. Skipped entirely when reduce-motion is on.
export function AnimatedEnter({
  children,
  style,
  duration = 300,
  translateYFrom = 12,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(translateYFrom)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then(setReduceMotion)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY, duration, reduceMotion]);

  if (reduceMotion) {
    return <Animated.View style={style}>{children}</Animated.View>;
  }

  return (
    <Animated.View
      style={[{ opacity, transform: [{ translateY }] }, style]}
    >
      {children}
    </Animated.View>
  );
}
