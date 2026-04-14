import { memo } from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { CategoryGlyph, normalizeCategory } from './CategoryGlyph';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import type { Stop } from '../types';

type Props = {
  stops: Stop[];
  style?: StyleProp<ViewStyle>;
};

/**
 * RouteOverlay — a vertical route preview widget showing stops connected
 * by dotted lines. Usable in trip detail screens as a "route preview"
 * without requiring a real MapView polyline SDK.
 */
function RouteOverlayBase({ stops, style }: Props) {
  if (stops.length === 0) return null;

  return (
    <View style={[styles.container, style]}>
      {stops.map((stop, index) => {
        const isLast = index === stops.length - 1;

        return (
          <View key={stop.id} style={styles.row}>
            {/* Left glyph column with connector */}
            <View style={styles.glyphColumn}>
              <CategoryGlyph
                category={normalizeCategory(stop.category)}
                size={28}
                variant="filled"
              />
              {!isLast && (
                <View style={styles.connector}>
                  {[0, 1, 2, 3].map((dot) => (
                    <View key={dot} style={styles.dot} />
                  ))}
                </View>
              )}
            </View>

            {/* Stop info */}
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>
                {stop.name}
              </Text>
              {(stop.planned_date || stop.location) && (
                <Text style={styles.detail} numberOfLines={1}>
                  {stop.planned_date ?? ''}{stop.planned_date && stop.location ? ' · ' : ''}{stop.location ?? ''}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export const RouteOverlay = memo(RouteOverlayBase);

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  glyphColumn: {
    alignItems: 'center',
    width: 28,
    marginRight: Spacing.md,
  },
  connector: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    gap: 4,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textTertiary,
  },
  info: {
    flex: 1,
    paddingTop: 4,
    paddingBottom: Spacing.md,
  },
  name: {
    ...Typography.bodyMed,
    color: Colors.text,
  },
  detail: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
