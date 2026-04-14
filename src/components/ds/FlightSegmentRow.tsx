import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Spacing, Typography } from '../../constants/theme';

export type FlightSegmentRowProps = {
  originCode: string;
  originTime: string;
  destinationCode: string;
  destinationTime: string;
  durationLabel?: string;
};

export function FlightSegmentRow({
  originCode,
  originTime,
  destinationCode,
  destinationTime,
  durationLabel,
}: FlightSegmentRowProps) {
  return (
    <View style={styles.root}>
      <View style={styles.side}>
        <Text style={styles.code}>{originCode}</Text>
        <Text style={styles.time}>{originTime}</Text>
      </View>
      <View style={styles.middle}>
        <View style={styles.line} />
        <View style={styles.planeBadge}>
          <Ionicons name="airplane" size={16} color="#FFFFFF" />
        </View>
        {durationLabel ? <Text style={styles.duration}>{durationLabel}</Text> : null}
      </View>
      <View style={[styles.side, styles.sideEnd]}>
        <Text style={styles.code}>{destinationCode}</Text>
        <Text style={styles.time}>{destinationTime}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  side: {
    width: 72,
    alignItems: 'flex-start',
  },
  sideEnd: {
    alignItems: 'flex-end',
  },
  code: {
    ...Typography.h2,
    color: Colors.text,
    letterSpacing: 0.5,
  },
  time: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  middle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  line: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    top: '50%',
    height: 1,
    backgroundColor: Colors.border,
  },
  planeBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  duration: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
