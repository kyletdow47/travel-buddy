import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../constants/theme';

type FlightInfo = {
  airline: string;
  flightNumber: string;
  departure: { code: string; city: string; time: string };
  arrival: { code: string; city: string; time: string };
  status: string;
  duration: string;
};

type Props = {
  flight: FlightInfo;
};

function statusColor(status: string): string {
  const lower = status.toLowerCase();
  if (lower === 'cancelled' || lower === 'canceled') return Colors.error;
  if (lower === 'delayed') return Colors.warning;
  return Colors.success;
}

function statusBg(status: string): string {
  const lower = status.toLowerCase();
  if (lower === 'cancelled' || lower === 'canceled') return `${Colors.error}22`;
  if (lower === 'delayed') return `${Colors.warning}22`;
  return `${Colors.success}22`;
}

function FlightCardBase({ flight }: Props) {
  const color = statusColor(flight.status);
  const bg = statusBg(flight.status);

  return (
    <View style={styles.card}>
      {/* Top: airline + flight number */}
      <View style={styles.eyebrowRow}>
        <Ionicons name="airplane" size={12} color={Colors.category.flight} />
        <Text style={styles.eyebrow} numberOfLines={1}>
          {flight.airline} · {flight.flightNumber}
        </Text>
      </View>

      {/* Middle: departure code — plane icon — arrival code */}
      <View style={styles.routeRow}>
        <View style={styles.endpoint}>
          <Text style={styles.iata}>{flight.departure.code}</Text>
          <Text style={styles.cityText} numberOfLines={1}>{flight.departure.city}</Text>
          <Text style={styles.timeText}>{flight.departure.time}</Text>
        </View>

        <View style={styles.routeCenter}>
          <View style={styles.dottedLine} />
          <View style={styles.planeBadge}>
            <Ionicons name="airplane" size={12} color="#FFFFFF" />
          </View>
          <Text style={styles.duration}>{flight.duration}</Text>
        </View>

        <View style={[styles.endpoint, styles.endpointRight]}>
          <Text style={styles.iata}>{flight.arrival.code}</Text>
          <Text style={[styles.cityText, { textAlign: 'right' }]} numberOfLines={1}>
            {flight.arrival.city}
          </Text>
          <Text style={[styles.timeText, { textAlign: 'right' }]}>{flight.arrival.time}</Text>
        </View>
      </View>

      {/* Bottom: status badge */}
      <View style={styles.footerRow}>
        <View style={[styles.statusChip, { backgroundColor: bg }]}>
          <View style={[styles.statusDot, { backgroundColor: color }]} />
          <Text style={[styles.statusText, { color }]}>{flight.status}</Text>
        </View>
      </View>
    </View>
  );
}

export const FlightCard = memo(FlightCardBase);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderOnCard,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  eyebrow: {
    ...Typography.micro,
    color: Colors.textOnCardSecondary,
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
    color: Colors.textOnCard,
  },
  cityText: {
    ...Typography.caption,
    color: Colors.textOnCardSecondary,
    marginTop: 2,
  },
  timeText: {
    ...Typography.caption,
    color: Colors.textOnCardTertiary,
    fontVariant: ['tabular-nums'],
    marginTop: 1,
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
    borderTopColor: 'rgba(0,0,0,0.16)',
    borderStyle: 'dashed',
  },
  planeBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.category.flight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  duration: {
    ...Typography.micro,
    color: Colors.textOnCardTertiary,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.xs,
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
