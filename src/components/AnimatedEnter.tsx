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
  translateYFrom?: number;
  delay?: number;
};

// Spring-based fade + slide-up entrance. Skipped when reduce-motion is on.
export function AnimatedEnter({
  children,
  style,
  translateYFrom = 16,
  delay = 0,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(translateYFrom)).current;
  const scale = useRef(new Animated.Value(0.97)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then(setReduceMotion)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const anim = Animated.parallel([
      Animated.spring(opacity, {
        toValue: 1,
        damping: 20,
        stiffness: 200,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 18,
        stiffness: 180,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        damping: 18,
        stiffness: 180,
        useNativeDriver: true,
      }),
    ]);
    if (delay > 0) {
      const timer = setTimeout(() => anim.start(), delay);
      return () => clearTimeout(timer);
    }
    anim.start();
    return undefined;
  }, [opacity, translateY, scale, delay, reduceMotion]);

  if (reduceMotion) {
    return <Animated.View style={style}>{children}</Animated.View>;
  }

  return (
    <Animated.View
      style={[{ opacity, transform: [{ translateY }, { scale }] }, style]}
    >
      {children}
    </Animated.View>
  );
}
