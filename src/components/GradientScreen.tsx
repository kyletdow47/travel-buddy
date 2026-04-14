import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Category, CategoryGradients } from '../constants/theme';

type Edge = 'top' | 'right' | 'bottom' | 'left';

export interface GradientScreenProps {
  /**
   * Travel category driving the gradient palette. Defaults to `"default"`
   * which renders the brand-orange wash.
   */
  category?: Category;
  /**
   * Override the three-stop gradient entirely. When provided, `category`
   * is ignored for color selection.
   */
  colors?: readonly [string, string, string];
  /**
   * Which safe-area edges to inset. Defaults to `['top']` so tab bars and
   * sheets can overlap the bottom edge without a white strip.
   */
  edges?: readonly Edge[];
  /**
   * Direction of the gradient. Defaults to a soft vertical wash.
   */
  direction?: 'vertical' | 'diagonal';
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/**
 * Full-screen wrapper applying a per-category Tripsy-style gradient wash.
 *
 * Renders behind a SafeAreaView so content keeps its padding while the
 * gradient extends into the status bar / home indicator region.
 */
export function GradientScreen({
  category = 'default',
  colors,
  edges = ['top'],
  direction = 'vertical',
  style,
  children,
}: GradientScreenProps) {
  const gradientColors = colors ?? CategoryGradients[category];
  const end = direction === 'diagonal' ? { x: 1, y: 1 } : { x: 0, y: 1 };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={gradientColors as unknown as readonly [string, string, string]}
        locations={[0, 0.45, 1]}
        start={{ x: 0, y: 0 }}
        end={end}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={edges as Edge[]} style={[styles.safeArea, style]}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});

export default GradientScreen;
