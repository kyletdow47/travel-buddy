import { memo } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { CategoryGlyph, CategoryKey } from './CategoryGlyph';
import { Colors, Shadows, Typography } from '../constants/theme';

type Props = {
  /** Total number of items represented by the ring (e.g. places count). */
  count: number;
  /** Max items the ring visualizes before it "wraps". Default 12. */
  maxCount?: number;
  /** Dominant category for the inner glyph. */
  category?: CategoryKey | string;
  /** Inner label override (falls back to count). */
  label?: string;
  /** Secondary label line under the count. */
  sublabel?: string;
  /** Pixel diameter of the outer ring. Default 176. */
  size?: number;
  /** Ring thickness. Default 6. */
  ringThickness?: number;
  /** Ring color. Default Colors.primary. */
  ringColor?: string;
  /** Optional tint for the inner disc. Default white on light bg, frosted on dark. */
  onDark?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * RingMapOverlay — the floating circular badge that sits on top of the
 * map in Tripsy's Places view. Visualizes count-of-items via an outer
 * dashed ring (simulated with a pattern of small dots) and a big inner
 * disc with a category glyph + count.
 *
 * We simulate the dashed ring using N tick-dots positioned around the
 * circumference (RN doesn't natively render a proper dashed circle).
 */
export const RingMapOverlay = memo(function RingMapOverlay({
  count,
  maxCount = 12,
  category = 'places',
  label,
  sublabel,
  size = 176,
  ringThickness = 6,
  ringColor = Colors.primary,
  onDark = false,
  style,
}: Props) {
  const ticks = Math.min(Math.max(count, 1), maxCount);
  const total = maxCount;
  const radius = size / 2 - ringThickness / 2;
  const dotSize = Math.max(4, Math.round(ringThickness * 0.9));
  const center = size / 2;

  const innerDiameter = size - ringThickness * 4;
  const innerBg = onDark ? Colors.frostedDarkStrong : Colors.surface;
  const textPrimary = onDark ? Colors.textOnDark : Colors.text;
  const textSecondary = onDark ? Colors.textOnDarkSecondary : Colors.textSecondary;

  const dots = Array.from({ length: total }, (_, i) => {
    const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
    const x = center + radius * Math.cos(angle) - dotSize / 2;
    const y = center + radius * Math.sin(angle) - dotSize / 2;
    const active = i < ticks;
    return (
      <View
        key={i}
        style={[
          styles.tick,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            left: x,
            top: y,
            backgroundColor: active ? ringColor : `${ringColor}33`,
          },
        ]}
      />
    );
  });

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`${count} ${label ?? 'places'}`}
      style={[{ width: size, height: size }, style]}
    >
      {/* Outer ring — dotted */}
      <View style={StyleSheet.absoluteFill}>{dots}</View>

      {/* Inner disc */}
      <View
        style={[
          styles.inner,
          Shadows.glyph,
          {
            width: innerDiameter,
            height: innerDiameter,
            borderRadius: innerDiameter / 2,
            left: (size - innerDiameter) / 2,
            top: (size - innerDiameter) / 2,
            backgroundColor: innerBg,
          },
        ]}
      >
        <CategoryGlyph category={category} size={36} />
        <Text style={[styles.count, { color: textPrimary }]} allowFontScaling>
          {label ?? String(count)}
        </Text>
        {sublabel ? (
          <Text style={[styles.sublabel, { color: textSecondary }]} numberOfLines={1}>
            {sublabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  tick: {
    position: 'absolute',
  },
  inner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  count: {
    ...Typography.displaySm,
    fontSize: 28,
    lineHeight: 32,
  },
  sublabel: {
    ...Typography.micro,
    textAlign: 'center',
  },
});
