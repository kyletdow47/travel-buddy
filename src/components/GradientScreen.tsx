import React, { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { CategoryColors, type CategoryKey } from '../constants/theme';

export interface GradientScreenProps {
  /**
   * Category key whose palette drives the gradient background. Defaults to
   * `default` (the app's primary orange wash).
   */
  category?: CategoryKey;
  /**
   * Override the gradient stops directly. Takes precedence over `category`.
   * Must contain at least two colors.
   */
  colors?: readonly [string, string, ...string[]];
  /**
   * Direction of the gradient. Defaults to a subtle top-to-bottom wash.
   */
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  /**
   * If true, the screen content is wrapped in a SafeAreaView so it avoids the
   * system insets. Defaults to true.
   */
  safeArea?: boolean;
  /**
   * Which edges the SafeAreaView should respect. Defaults to top + bottom.
   */
  edges?: readonly Edge[];
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  children?: ReactNode;
}

const DEFAULT_START = { x: 0.5, y: 0 };
const DEFAULT_END = { x: 0.5, y: 1 };
const DEFAULT_EDGES: readonly Edge[] = ['top', 'bottom'];

/**
 * Full-bleed screen wrapper that paints a category-tinted gradient behind its
 * children. Use at the root of a screen to give it the Tripsy-style wash.
 */
export function GradientScreen({
  category = 'default',
  colors,
  start = DEFAULT_START,
  end = DEFAULT_END,
  safeArea = true,
  edges = DEFAULT_EDGES,
  style,
  contentStyle,
  children,
}: GradientScreenProps) {
  const palette = CategoryColors[category] ?? CategoryColors.default;
  const gradientColors = (colors ?? palette.gradient) as readonly [
    string,
    string,
    ...string[],
  ];

  return (
    <LinearGradient
      colors={gradientColors}
      start={start}
      end={end}
      style={[styles.fill, style]}
    >
      {safeArea ? (
        <SafeAreaView style={[styles.fill, contentStyle]} edges={edges}>
          {children}
        </SafeAreaView>
      ) : (
        <View style={[styles.fill, contentStyle]}>{children}</View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});

export default GradientScreen;
