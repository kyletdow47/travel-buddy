import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Reservation } from '../types';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { FrostedSheet } from './FrostedSheet';
import { QuickActionCircle } from './QuickActionCircle';
import { normalizeReservationType } from './ReservationRow';

const TYPE_META: Record<
  string,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  flight: { label: 'Flight', icon: 'airplane-outline', color: Colors.category.flight },
  lodging: { label: 'Lodging', icon: 'bed-outline', color: Colors.category.lodging },
  car: { label: 'Car', icon: 'car-outline', color: Colors.category.gas },
  train: { label: 'Train', icon: 'train-outline', color: Colors.category.transport },
  activity: { label: 'Activity', icon: 'bicycle-outline', color: Colors.category.activity },
};

function statusMeta(status: string | null) {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmed', color: Colors.success, bg: `${Colors.success}1A` };
    case 'cancelled':
      return { label: 'Cancelled', color: Colors.error, bg: `${Colors.error}1A` };
    default:
      return { label: 'Pending', color: Colors.warning, bg: `${Colors.warning}1A` };
  }
}

function formatDatetime(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  }) +
    ' at ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

type Props = {
  reservation: Reservation | null;
  visible: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function ReservationDetailSheet({
  reservation,
  visible,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  if (!reservation) return null;

  const type = normalizeReservationType(reservation.type);
  const meta = TYPE_META[type] ?? TYPE_META.activity;
  const sMeta = statusMeta(reservation.status);
  const startLabel = formatDatetime(reservation.start_datetime);
  const endLabel = formatDatetime(reservation.end_datetime);

  return (
    <FrostedSheet
      visible={visible}
      onClose={onClose}
      tint="light"
      maxHeightRatio={0.72}
      accessibilityLabel={`Reservation details: ${reservation.provider}`}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Hero row -- large type icon + provider + confirmation code */}
        <View style={styles.heroRow}>
          <View style={[styles.heroGlyph, { backgroundColor: `${meta.color}18` }]}>
            <Ionicons name={meta.icon} size={32} color={meta.color} />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.provider} numberOfLines={2}>
              {reservation.provider ?? 'Unknown provider'}
            </Text>
            {reservation.confirmation_code ? (
              <Text style={styles.confirmationCode} numberOfLines={1}>
                #{reservation.confirmation_code}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Chips row */}
        <View style={styles.chipsRow}>
          {/* Type chip */}
          <View style={[styles.chip, { backgroundColor: `${meta.color}18` }]}>
            <Ionicons name={meta.icon} size={14} color={meta.color} />
            <Text style={[styles.chipText, { color: meta.color }]}>{meta.label}</Text>
          </View>

          {/* Status chip */}
          <View style={[styles.chip, { backgroundColor: sMeta.bg }]}>
            <Text style={[styles.chipText, { color: sMeta.color }]}>{sMeta.label}</Text>
          </View>

          {/* Start date chip */}
          {startLabel ? (
            <View style={[styles.chip, { backgroundColor: Colors.surfaceDim }]}>
              <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
              <Text style={[styles.chipText, { color: Colors.textSecondary }]}>
                {startLabel}
              </Text>
            </View>
          ) : null}

          {/* End date chip */}
          {endLabel ? (
            <View style={[styles.chip, { backgroundColor: Colors.surfaceDim }]}>
              <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
              <Text style={[styles.chipText, { color: Colors.textSecondary }]}>
                {endLabel}
              </Text>
            </View>
          ) : null}

          {/* Location chip */}
          {reservation.location ? (
            <View style={[styles.chip, { backgroundColor: Colors.surfaceDim }]}>
              <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
              <Text style={[styles.chipText, { color: Colors.textSecondary }]}>
                {reservation.location}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Notes */}
        {reservation.notes ? (
          <View style={styles.notesBox}>
            <Ionicons name="document-text-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.notesText}>{reservation.notes}</Text>
          </View>
        ) : null}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Quick actions */}
        <View style={styles.actionsRow}>
          <QuickActionCircle
            icon="create-outline"
            label="Edit"
            primary
            onPress={onEdit}
          />
          {onDelete ? (
            <QuickActionCircle
              icon="trash-outline"
              label="Delete"
              onPress={onDelete}
            />
          ) : null}
        </View>
      </ScrollView>
    </FrostedSheet>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: Spacing.xl,
  },

  // Hero
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  heroGlyph: {
    width: 72,
    height: 72,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heroText: {
    flex: 1,
    gap: 4,
  },
  provider: {
    ...Typography.h2,
    color: Colors.text,
    lineHeight: 26,
  },
  confirmationCode: {
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 20,
    fontVariant: ['tabular-nums'] as const,
    color: Colors.primary,
  },

  // Chips
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  chipText: {
    ...Typography.micro,
    fontWeight: '700',
  },

  // Notes
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  notesText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.sm,
  },
});
