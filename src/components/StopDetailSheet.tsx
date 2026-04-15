import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Stop } from '../types';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { FrostedSheet } from './FrostedSheet';
import { CategoryGlyph, normalizeCategory, categoryColor } from './CategoryGlyph';
import { QuickActionCircle } from './QuickActionCircle';
import { ChangeDateSheet } from './ChangeDateSheet';

type StopStatus = 'upcoming' | 'current' | 'done';

function statusMeta(status: StopStatus) {
  switch (status) {
    case 'current':
      return { label: 'Now', color: Colors.primary, bg: Colors.primaryTinted };
    case 'done':
      return { label: 'Done', color: Colors.textSecondary, bg: Colors.border };
    default:
      return { label: 'Upcoming', color: Colors.info, bg: 'rgba(58,164,255,0.12)' };
  }
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  });
}

type Props = {
  stop: Stop | null;
  visible: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onStatusCycle?: () => void;
  onDelete?: () => void;
  onChangeDate?: (newDate: string | null) => void;
};

export function StopDetailSheet({
  stop,
  visible,
  onClose,
  onEdit,
  onStatusCycle,
  onDelete,
  onChangeDate,
}: Props) {
  const [changeDateOpen, setChangeDateOpen] = useState(false);

  const openDirections = useCallback(() => {
    if (!stop) return;
    const query = encodeURIComponent(stop.location ?? stop.name);
    const url =
      stop.lat != null && stop.lng != null
        ? Platform.OS === 'ios'
          ? `http://maps.apple.com/?q=${query}&ll=${stop.lat},${stop.lng}`
          : `https://www.google.com/maps/search/?api=1&query=${stop.lat},${stop.lng}`
        : Platform.OS === 'ios'
          ? `http://maps.apple.com/?q=${query}`
          : `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch(() => undefined);
  }, [stop]);

  if (!stop) return null;

  const cat = normalizeCategory(stop.category);
  const accentColor = categoryColor(stop.category);
  const status = (stop.status as StopStatus) ?? 'upcoming';
  const sMeta = statusMeta(status);
  const dateLabel = formatDate(stop.planned_date);

  return (
    <FrostedSheet
      visible={visible}
      onClose={onClose}
      tint="light"
      maxHeightRatio={0.72}
      accessibilityLabel={`Stop details: ${stop.name}`}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Hero row — large CategoryGlyph + title */}
        <View style={styles.heroRow}>
          <View style={[styles.heroGlyph, { backgroundColor: `${accentColor}18` }]}>
            <CategoryGlyph category={cat} size={44} elevated />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.name} numberOfLines={2}>
              {stop.name}
            </Text>
            {stop.location ? (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={13} color={Colors.textTertiary} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {stop.location}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Chips row */}
        <View style={styles.chipsRow}>
          {/* Status chip — tappable to cycle */}
          <TouchableOpacity
            style={[styles.chip, { backgroundColor: sMeta.bg }]}
            activeOpacity={0.8}
            onPress={onStatusCycle}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.chipText, { color: sMeta.color }]}>
              {sMeta.label}
            </Text>
          </TouchableOpacity>

          {/* Category chip */}
          <View style={[styles.chip, { backgroundColor: `${accentColor}18` }]}>
            <CategoryGlyph category={cat} size={28} variant="tinted" elevated={false} />
            <Text style={[styles.chipText, { color: accentColor }]}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </View>

          {/* Date chip */}
          {dateLabel ? (
            <View style={[styles.chip, { backgroundColor: Colors.surfaceDim }]}>
              <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
              <Text style={[styles.chipText, { color: Colors.textSecondary }]}>
                {dateLabel}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Notes */}
        {stop.notes ? (
          <View style={styles.notesBox}>
            <Ionicons name="document-text-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.notesText}>{stop.notes}</Text>
          </View>
        ) : null}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Quick actions */}
        <View style={styles.actionsRow}>
          <QuickActionCircle
            icon="navigate"
            label="Directions"
            primary
            onPress={openDirections}
          />
          <QuickActionCircle
            icon="create-outline"
            label="Edit"
            onPress={onEdit}
          />
          <QuickActionCircle
            icon="calendar-outline"
            label="Date"
            onPress={() => setChangeDateOpen(true)}
          />
          <QuickActionCircle
            icon="repeat-outline"
            label="Status"
            onPress={onStatusCycle}
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

      {/* Change Date Sheet */}
      {stop && onChangeDate ? (
        <ChangeDateSheet
          visible={changeDateOpen}
          currentDate={stop.planned_date}
          stopName={stop.name}
          onClose={() => setChangeDateOpen(false)}
          onSave={onChangeDate}
        />
      ) : null}
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
  name: {
    ...Typography.h2,
    color: Colors.text,
    lineHeight: 26,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
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
