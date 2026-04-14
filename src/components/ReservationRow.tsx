import { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Reservation } from '../types';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

type ReservationType = 'flight' | 'lodging' | 'car' | 'train' | 'activity';

const TYPE_META: Record<
  ReservationType,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  flight: { label: 'Flight', icon: 'airplane-outline', color: Colors.category.flight },
  lodging: { label: 'Lodging', icon: 'bed-outline', color: Colors.category.lodging },
  car: { label: 'Car', icon: 'car-outline', color: Colors.category.gas },
  train: { label: 'Train', icon: 'train-outline', color: Colors.category.transport },
  activity: { label: 'Activity', icon: 'bicycle-outline', color: Colors.category.activity },
};

export function normalizeReservationType(raw: string | null | undefined): ReservationType {
  const value = (raw ?? '').toLowerCase();
  if (value === 'flight' || value === 'lodging' || value === 'car' || value === 'train' || value === 'activity') {
    return value;
  }
  return 'activity';
}

function statusColor(status: string | null): { bg: string; text: string } {
  switch (status) {
    case 'confirmed':
      return { bg: `${Colors.success}1A`, text: Colors.success };
    case 'pending':
      return { bg: `${Colors.warning}1A`, text: Colors.warning };
    case 'cancelled':
      return { bg: `${Colors.error}1A`, text: Colors.error };
    default:
      return { bg: Colors.surfaceDim, text: Colors.textSecondary };
  }
}

function formatShortDatetime(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

type Props = {
  reservation: Reservation;
  onPress?: () => void;
  onLongPress?: () => void;
};

function ReservationRowBase({ reservation, onPress, onLongPress }: Props) {
  const type = normalizeReservationType(reservation.type);
  const meta = TYPE_META[type];
  const sColor = statusColor(reservation.status);

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.8}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${meta.color}26` }]}>
        <Ionicons name={meta.icon} size={20} color={meta.color} />
      </View>

      <View style={styles.center}>
        <Text style={styles.provider} numberOfLines={1}>
          {reservation.provider ?? 'Unknown provider'}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {reservation.confirmation_code ? `#${reservation.confirmation_code}` : meta.label}
          {reservation.start_datetime
            ? ` · ${formatShortDatetime(reservation.start_datetime)}`
            : ''}
        </Text>
      </View>

      <View style={[styles.statusBadge, { backgroundColor: sColor.bg }]}>
        <Text style={[styles.statusText, { color: sColor.text }]}>
          {reservation.status
            ? reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)
            : 'Pending'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export const ReservationRow = memo(ReservationRowBase);

export function ReservationSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  provider: {
    ...Typography.bodyMed,
    fontWeight: '600',
    color: Colors.text,
  },
  meta: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusText: {
    ...Typography.micro,
    fontWeight: '700',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: Spacing.lg + 40 + Spacing.md,
  },
});
