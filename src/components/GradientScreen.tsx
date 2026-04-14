import { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../constants/theme';

type GradientKey = keyof typeof Colors.gradient;

type LinearGradientComponent = React.ComponentType<{
  colors: readonly string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  locations?: readonly number[];
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}>;

let LinearGradient: LinearGradientComponent | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  LinearGradient = require('expo-linear-gradient').LinearGradient ?? null;
} catch {
  LinearGradient = null;
}

type Props = {
  /** Preset gradient key, or pass `colors` to override. */
  preset?: GradientKey;
  /** Override gradient stops. Takes precedence over preset. */
  colors?: readonly string[];
  /** Gradient direction. Default top→bottom. */
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  children?: ReactNode;
  /** Wrap in SafeAreaView. Default true. */
  safeArea?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * GradientScreen — full-screen background with per-category gradient.
 * Used for Flight Alerts, Places, and trip category subscreens.
 * Falls back to a solid color if expo-linear-gradient isn't available.
 */
export function GradientScreen({
  preset = 'flight',
  colors,
  start = { x: 0.5, y: 0 },
  end = { x: 0.5, y: 1 },
  children,
  safeArea = true,
  style,
  contentStyle,
}: Props) {
  const stops =
    colors ?? (Colors.gradient[preset] as unknown as readonly string[]);

  const Wrapper = safeArea ? SafeAreaView : View;

  const body = LinearGradient ? (
    <LinearGradient
      colors={stops}
      start={start}
      end={end}
      style={[styles.fill, style]}
    >
      <Wrapper style={[styles.fill, contentStyle]}>{children}</Wrapper>
    </LinearGradient>
  ) : (
    <View style={[styles.fill, { backgroundColor: stops[stops.length - 1] ?? Colors.surfaceDark }, style]}>
      <Wrapper style={[styles.fill, contentStyle]}>{children}</Wrapper>
    </View>
  );

  return body;
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
