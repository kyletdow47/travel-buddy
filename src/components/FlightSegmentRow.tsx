import { memo } from 'react';
import { View, Text, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

export type FlightSegment = {
  /** e.g. "DL 2345" */
  flightNumber?: string | null;
  /** e.g. "Delta Air Lines" */
  airline?: string | null;
  /** IATA origin, e.g. "JFK" */
  from: string;
  /** IATA destination, e.g. "LAX" */
  to: string;
  /** Local depart time, e.g. "6:45 AM" */
  departTime?: string | null;
  /** Local arrive time, e.g. "10:12 AM" */
  arriveTime?: string | null;
  /** Optional date label e.g. "Jun 12" */
  dateLabel?: string | null;
  /** Duration label e.g. "5h 27m" */
  duration?: string | null;
  /** Optional gate / terminal label e.g. "T4 · B22" */
  gate?: string | null;
  /** Status copy (e.g. "On time", "Delayed 25m") */
  status?: string | null;
  /** Semantic status tone */
  statusTone?: 'ok' | 'warn' | 'error' | 'info';
};

type Props = {
  segment: FlightSegment;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Show as a dark/frosted-sheet card instead of light surface. */
  onDark?: boolean;
};

const TONE_COLOR: Record<NonNullable<FlightSegment['statusTone']>, string> = {
  ok: Colors.success,
  warn: Colors.warning,
  error: Colors.error,
  info: Colors.info,
};

/**
 * FlightSegmentRow — Tripsy's signature flight card.
 * Two big airport codes flanking a dotted route with an airplane glyph;
 * airline + flight number eyebrow; departure/arrival times under each code;
 * status chip at the bottom.
 */
export const FlightSegmentRow = memo(function FlightSegmentRow({
  segment,
  onPress,
  style,
  onDark = false,
}: Props) {
  const {
    flightNumber,
    airline,
    from,
    to,
    departTime,
    arriveTime,
    dateLabel,
    duration,
    gate,
    status,
    statusTone = 'ok',
  } = segment;

  const textPrimary = onDark ? Colors.textOnDark : Colors.text;
  const textSecondary = onDark ? Colors.textOnDarkSecondary : Colors.textSecondary;
  const textTertiary = onDark ? Colors.textOnDarkTertiary : Colors.textTertiary;
  const surface = onDark ? 'rgba(255,255,255,0.06)' : Colors.surface;
  const border = onDark ? Colors.borderOnDark : Colors.border;
  const divider = onDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.16)';

  const Wrapper: typeof Pressable = onPress ? Pressable : (View as unknown as typeof Pressable);

  return (
    <Wrapper
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={
        `${airline ?? 'Flight'} ${flightNumber ?? ''} from ${from} to ${to}`.trim()
      }
      style={({ pressed }: { pressed?: boolean } = {}) => [
        styles.card,
        { backgroundColor: surface, borderColor: border },
        pressed ? { opacity: 0.9 } : null,
        style,
      ]}
    >
      {/* Eyebrow: airline · flight # · date */}
      {(airline || flightNumber || dateLabel) && (
        <View style={styles.eyebrowRow}>
          <Ionicons name="airplane" size={12} color={Colors.category.flight} />
          <Text style={[styles.eyebrow, { color: textSecondary }]} numberOfLines={1}>
            {[airline, flightNumber, dateLabel].filter(Boolean).join(' · ')}
          </Text>
        </View>
      )}

      {/* Route row */}
      <View style={styles.routeRow}>
        <View style={styles.endpoint}>
          <Text style={[styles.iata, { color: textPrimary }]}>{from}</Text>
          {departTime ? (
            <Text style={[styles.time, { color: textSecondary }]} numberOfLines={1}>
              {departTime}
            </Text>
          ) : null}
        </View>

        {/* Dotted line with airplane glyph in middle */}
        <View style={styles.routeCenter}>
          <View style={[styles.dottedLine, { borderTopColor: divider }]} />
          <View style={[styles.planeBadge, { backgroundColor: Colors.category.flight }]}>
            <Ionicons name="airplane" size={12} color="#FFFFFF" />
          </View>
          {duration ? (
            <Text style={[styles.duration, { color: textTertiary }]} numberOfLines={1}>
              {duration}
            </Text>
          ) : null}
        </View>

        <View style={[styles.endpoint, styles.endpointRight]}>
          <Text style={[styles.iata, { color: textPrimary }]}>{to}</Text>
          {arriveTime ? (
            <Text
              style={[styles.time, { color: textSecondary, textAlign: 'right' }]}
              numberOfLines={1}
            >
              {arriveTime}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Footer: gate + status */}
      {(gate || status) && (
        <View style={styles.footerRow}>
          {gate ? (
            <View style={styles.footerItem}>
              <Ionicons name="enter-outline" size={12} color={textTertiary} />
              <Text style={[styles.footerText, { color: textSecondary }]} numberOfLines={1}>
                {gate}
              </Text>
            </View>
          ) : (
            <View style={{ flex: 1 }} />
          )}
          {status ? (
            <View
              style={[
                styles.statusChip,
                { backgroundColor: `${TONE_COLOR[statusTone]}22` },
              ]}
            >
              <View
                style={[styles.statusDot, { backgroundColor: TONE_COLOR[statusTone] }]}
              />
              <Text style={[styles.statusText, { color: TONE_COLOR[statusTone] }]}>
                {status}
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </Wrapper>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  eyebrow: {
    ...Typography.micro,
    flex: 1,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  endpoint: {
    flexShrink: 0,
    minWidth: 64,
  },
  endpointRight: {
    alignItems: 'flex-end',
  },
  iata: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  time: {
    ...Typography.caption,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  routeCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  dottedLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 15,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
  },
  planeBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  duration: {
    ...Typography.micro,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  footerText: {
    ...Typography.caption,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...Typography.micro,
  },
});
