import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../constants/theme';

type Waypoint = {
  name: string;
  estimatedArrival: string;
  distanceLabel: string;
};

type Props = {
  waypoint: Waypoint;
  index: number;
  showConnector?: boolean;
};

function WaypointRowBase({ waypoint, index, showConnector = false }: Props) {
  return (
    <View style={styles.wrapper}>
      {/* Left: numbered circle + connector */}
      <View style={styles.timelineCol}>
        <View style={styles.numberCircle}>
          <Text style={styles.numberText}>{index + 1}</Text>
        </View>
        {showConnector && <View style={styles.connector} />}
      </View>

      {/* Card */}
      <View style={styles.card}>
        <View style={styles.cardMain}>
          <Text style={styles.name} numberOfLines={1}>{waypoint.name}</Text>
          <Text style={styles.arrival}>ETA: {waypoint.estimatedArrival}</Text>
        </View>
        <View style={styles.distanceCol}>
          <Text style={styles.distanceText} numberOfLines={1}>{waypoint.distanceLabel}</Text>
        </View>
      </View>
    </View>
  );
}

export const WaypointRow = memo(WaypointRowBase);

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  timelineCol: {
    width: 36,
    alignItems: 'center',
    paddingTop: 2,
    marginRight: Spacing.sm,
  },
  numberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glyph,
  },
  numberText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.surface,
    lineHeight: 16,
  },
  connector: {
    width: 2,
    flex: 1,
    minHeight: 24,
    borderRadius: 1,
    marginTop: Spacing.xs,
    backgroundColor: `${Colors.primary}40`,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  cardMain: {
    flex: 1,
    gap: 3,
  },
  name: {
    ...Typography.bodyMed,
    fontWeight: '700',
    color: Colors.text,
  },
  arrival: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  distanceCol: {
    marginLeft: Spacing.sm,
    alignItems: 'flex-end',
  },
  distanceText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    fontVariant: ['tabular-nums'],
  },
});
