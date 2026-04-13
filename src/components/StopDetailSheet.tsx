import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Linking,
  Dimensions,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Stop } from '../types';
import { Colors, Typography, Spacing, Radius, Shadows } from '../constants/theme';

type CategoryKey = 'hotel' | 'food' | 'gas' | 'activity' | 'other';
type StopStatus = 'upcoming' | 'current' | 'done';

const CATEGORY_META: Record<
  CategoryKey,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  hotel: { label: 'Hotel', icon: 'bed-outline', color: Colors.category.hotel },
  food: { label: 'Food', icon: 'restaurant-outline', color: Colors.category.food },
  gas: { label: 'Gas', icon: 'car-outline', color: Colors.category.gas },
  activity: { label: 'Activity', icon: 'bicycle-outline', color: Colors.category.activity },
  other: { label: 'Other', icon: 'ellipse-outline', color: Colors.category.other },
};

function normalizeCategory(raw: string | null | undefined): CategoryKey {
  const value = (raw ?? '').toLowerCase();
  if (value === 'hotel' || value === 'food' || value === 'gas' || value === 'activity') {
    return value;
  }
  return 'other';
}

function statusMeta(status: StopStatus) {
  switch (status) {
    case 'current':
      return { label: '▸ Now', color: Colors.primary, bg: Colors.primaryLight };
    case 'done':
      return { label: '✓ Done', color: Colors.textSecondary, bg: Colors.border };
    default:
      return { label: '⬡ Upcoming', color: Colors.info, bg: 'rgba(59,130,246,0.12)' };
  }
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

type Props = {
  stop: Stop | null;
  photoUrl?: string | null;
  visible: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onStatusCycle?: () => void;
};

const SCREEN_H = Dimensions.get('window').height;
const MAX_SHEET_H = SCREEN_H * 0.55;

export function StopDetailSheet({
  stop,
  photoUrl,
  visible,
  onClose,
  onEdit,
  onStatusCycle,
}: Props) {
  const translateY = useRef(new Animated.Value(MAX_SHEET_H)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 18,
          stiffness: 180,
          mass: 0.9,
        }),
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: MAX_SHEET_H,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdrop]);

  if (!stop) return null;

  const category = normalizeCategory(stop.category);
  const cMeta = CATEGORY_META[category];
  const status = (stop.status as StopStatus) ?? 'upcoming';
  const sMeta = statusMeta(status);
  const dateLabel = formatDate(stop.planned_date);

  const openDirections = () => {
    if (stop.lat == null || stop.lng == null) return;
    const query = encodeURIComponent(stop.name);
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?q=${query}&ll=${stop.lat},${stop.lng}`
        : `https://www.google.com/maps/search/?api=1&query=${stop.lat},${stop.lng}`;
    Linking.openURL(url).catch(() => undefined);
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={StyleSheet.absoluteFill}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.backdrop,
              { opacity: backdrop },
            ]}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY }], maxHeight: MAX_SHEET_H },
          ]}
        >
          <View style={styles.handle} />

          {/* Hero */}
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.hero} />
          ) : (
            <View style={[styles.hero, { backgroundColor: `${cMeta.color}22` }]}>
              <Ionicons name={cMeta.icon} size={48} color={cMeta.color} />
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.name} numberOfLines={1}>
              {stop.name}
            </Text>

            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.metaText} numberOfLines={1}>
                {stop.location ?? 'Location TBD'}
              </Text>
            </View>

            <View style={styles.chipsRow}>
              <View style={[styles.chip, { backgroundColor: `${cMeta.color}1A` }]}>
                <Ionicons name={cMeta.icon} size={12} color={cMeta.color} />
                <Text style={[styles.chipText, { color: cMeta.color }]}>{cMeta.label}</Text>
              </View>
              {dateLabel && (
                <View style={[styles.chip, { backgroundColor: Colors.background }]}>
                  <Ionicons
                    name="calendar-outline"
                    size={12}
                    color={Colors.textSecondary}
                  />
                  <Text style={[styles.chipText, { color: Colors.textSecondary }]}>
                    {dateLabel}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.statusChip, { backgroundColor: sMeta.bg }]}
                onPress={onStatusCycle}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.statusChipText, { color: sMeta.color }]}>
                  {sMeta.label}
                </Text>
              </TouchableOpacity>
            </View>

            {stop.notes ? (
              <View style={styles.notes}>
                <Text style={styles.notesText}>{stop.notes}</Text>
              </View>
            ) : null}

            {/* Action row */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.primaryAction}
                activeOpacity={0.85}
                onPress={openDirections}
              >
                <Ionicons name="navigate-outline" size={18} color={Colors.surface} />
                <Text style={styles.primaryActionText}>Get Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ghostAction}
                activeOpacity={0.85}
                onPress={onEdit}
              >
                <Ionicons name="create-outline" size={18} color={Colors.text} />
                <Text style={styles.ghostActionText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: Colors.overlay,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingBottom: Spacing.xl,
    ...Shadows.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 32,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  hero: {
    width: '100%',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.lg,
  },
  name: {
    ...Typography.h2,
    color: Colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  chipText: {
    ...Typography.micro,
  },
  statusChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  statusChipText: {
    ...Typography.micro,
    fontWeight: '700',
  },
  notes: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
  },
  notesText: {
    ...Typography.body,
    color: Colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  primaryAction: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    ...Shadows.sm,
  },
  primaryActionText: {
    ...Typography.bodyMed,
    color: Colors.surface,
    fontWeight: '700',
  },
  ghostAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.background,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ghostActionText: {
    ...Typography.bodyMed,
    color: Colors.text,
    fontWeight: '600',
  },
});
