import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import {
  Category,
  CategoryGradients,
  GradientStops,
} from '../constants/theme';

type GradientDirection = 'vertical' | 'diagonal';

export interface GradientScreenProps {
  /**
   * Category token that drives the gradient palette. Ignored when `colors` is set.
   * Defaults to `'default'` (brand orange wash).
   */
  category?: Category;
  /**
   * Explicit 3-stop gradient override. Takes precedence over `category`.
   */
  colors?: GradientStops;
  /**
   * Gradient direction. `vertical` (default) runs top→bottom,
   * `diagonal` runs top-left → bottom-right.
   */
  direction?: GradientDirection;
  /**
   * SafeAreaView edges to pad for. Defaults to `['top']` so a bottom
   * tab bar / sheet can sit flush against the gradient.
   */
  edges?: readonly Edge[];
  /**
   * Set to `false` to skip the SafeAreaView wrapper (the gradient still
   * extends to the screen edges).
   */
  safeArea?: boolean;
  style?: ViewStyle;
  children?: React.ReactNode;
}

const DIRECTIONS: Record<
  GradientDirection,
  { start: { x: number; y: number }; end: { x: number; y: number } }
> = {
  vertical: { start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } },
  diagonal: { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
};

/**
 * Full-bleed screen wrapper that paints a per-category gradient wash
 * behind its children. The wash extends into the status bar area while
 * content is kept inside the configured SafeAreaView edges.
 */
export function GradientScreen({
  category = 'default',
  colors,
  direction = 'vertical',
  edges = ['top'],
  safeArea = true,
  style,
  children,
}: GradientScreenProps) {
  const stops = colors ?? CategoryGradients[category];
  const { start, end } = DIRECTIONS[direction];

  const content = safeArea ? (
    <SafeAreaView style={[styles.fill, style]} edges={edges}>
      {children}
    </SafeAreaView>
  ) : (
    <View style={[styles.fill, style]}>{children}</View>
  );

  return (
    <View style={styles.fill}>
      <LinearGradient
        colors={[stops[0], stops[1], stops[2]]}
        locations={[0, 0.45, 1]}
        start={start}
        end={end}
        style={StyleSheet.absoluteFill}
      />
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});

export default GradientScreen;
