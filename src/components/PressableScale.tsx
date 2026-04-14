import { useRef, useEffect, useState } from 'react';
import {
  Pressable,
  Animated,
  AccessibilityInfo,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type Props = PressableProps & {
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
};

export function PressableScale({
  children,
  scaleTo = 0.96,
  style,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then(setReduceMotion)
      .catch(() => undefined);
  }, []);

  return (
    <Pressable
      {...rest}
      onPressIn={(e) => {
        if (!reduceMotion) {
          Animated.spring(scale, {
            toValue: scaleTo,
            useNativeDriver: true,
            stiffness: 200,
            damping: 20,
          }).start();
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (!reduceMotion) {
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            stiffness: 200,
            damping: 20,
          }).start();
        }
        onPressOut?.(e);
      }}
    >
      <Animated.View style={[{ transform: reduceMotion ? undefined : [{ scale }] }, style]}>
        {children as React.ReactNode}
      </Animated.View>
    </Pressable>
  );
}
