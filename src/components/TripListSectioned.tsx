import { useMemo } from 'react';
import {
  SectionList,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Trip } from '../types';
import { Colors, Radius, Spacing, Typography, Shadows } from '../constants/theme';

export type TripBucket = 'active' | 'upcoming' | 'past';

type Props = {
  trips: Trip[];
  onPressTrip?: (trip: Trip) => void;
  onPressNew?: () => void;
  /** Optional empty-state renderer. */
  renderEmpty?: () => React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

function bucketTrip(t: Trip, now: Date): TripBucket {
  const start = t.start_date ? new Date(t.start_date) : null;
  const end = t.end_date ? new Date(t.end_date) : null;
  const today = new Date(now).setHours(0, 0, 0, 0);

  if (start && end) {
    const s = new Date(start).setHours(0, 0, 0, 0);
    const e = new Date(end).setHours(23, 59, 59, 999);
    if (today < s) return 'upcoming';
    if (today > e) return 'past';
    return 'active';
  }
  if (start) {
    return new Date(start).setHours(0, 0, 0, 0) < today ? 'past' : 'upcoming';
  }
  return 'upcoming';
}

const BUCKET_ORDER: TripBucket[] = ['active', 'upcoming', 'past'];
const BUCKET_LABEL: Record<TripBucket, string> = {
  active: 'Active',
  upcoming: 'Upcoming',
  past: 'Past',
};

function formatRange(t: Trip): string {
  const s = t.start_date ? new Date(t.start_date) : null;
  const e = t.end_date ? new Date(t.end_date) : null;
  if (!s && !e) return 'Dates TBD';
  const f = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (s && e) return `${f(s)} – ${f(e)}`;
  return f((s ?? e)!);
}

export function TripListSectioned({
  trips,
  onPressTrip,
  onPressNew,
  renderEmpty,
  style,
  contentContainerStyle,
}: Props) {
  const sections = useMemo(() => {
    const now = new Date();
    const buckets: Record<TripBucket, Trip[]> = {
      active: [],
      upcoming: [],
      past: [],
    };
    for (const t of trips) {
      // Skip archived trips.
      if ((t as Trip & { archived_at?: string | null }).archived_at) continue;
      buckets[bucketTrip(t, now)].push(t);
    }
    // Sort: active by end ascending, upcoming by start ascending, past by end descending.
    buckets.active.sort((a, b) => (a.end_date ?? '').localeCompare(b.end_date ?? ''));
    buckets.upcoming.sort((a, b) =>
      (a.start_date ?? '').localeCompare(b.start_date ?? ''),
    );
    buckets.past.sort((a, b) => (b.end_date ?? '').localeCompare(a.end_date ?? ''));

    return BUCKET_ORDER.filter((b) => buckets[b].length > 0).map((b) => ({
      title: BUCKET_LABEL[b],
      bucket: b,
      data: buckets[b],
    }));
  }, [trips]);

  if (trips.length === 0 && renderEmpty) {
    return <>{renderEmpty()}</>;
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      style={style}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={[Typography.eyebrow, styles.sectionTitle]}>
            {section.title}
          </Text>
          <Text style={styles.sectionCount}>{section.data.length}</Text>
        </View>
      )}
      renderItem={({ item, section }) => (
        <TripCard
          trip={item}
          bucket={(section as { bucket: TripBucket }).bucket}
          onPress={() => onPressTrip?.(item)}
        />
      )}
      ListFooterComponent={
        onPressNew ? (
          <Pressable
            onPress={onPressNew}
            style={({ pressed }) => [
              styles.newTripBtn,
              pressed ? { opacity: 0.85 } : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Create a new trip"
          >
            <Ionicons name="add" size={18} color={Colors.primary} />
            <Text style={styles.newTripText}>New trip</Text>
          </Pressable>
        ) : null
      }
    />
  );
}

function TripCard({
  trip,
  bucket,
  onPress,
}: {
  trip: Trip;
  bucket: TripBucket;
  onPress?: () => void;
}) {
  const coverUrl =
    (trip as Trip & { cover_photo_url?: string | null }).cover_photo_url ?? null;
  const flag =
    (trip as Trip & { country_flag?: string | null }).country_flag ?? null;

  const badgeTone =
    bucket === 'active'
      ? { bg: Colors.primaryLight, color: Colors.primaryDark, label: 'Now' }
      : bucket === 'upcoming'
        ? { bg: 'rgba(58,164,255,0.14)', color: Colors.info, label: 'Soon' }
        : { bg: Colors.surfaceDim, color: Colors.textSecondary, label: 'Past' };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed ? { opacity: 0.92, transform: [{ scale: 0.995 }] } : null,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${trip.name}`}
    >
      <View style={styles.thumb}>
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} style={styles.thumbImage} />
        ) : (
          <View style={[styles.thumbImage, styles.thumbFallback]}>
            <Ionicons name="airplane-outline" size={24} color={Colors.textTertiary} />
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {flag ? `${flag}  ` : ''}
            {trip.name}
          </Text>
          <View style={[styles.badge, { backgroundColor: badgeTone.bg }]}>
            <Text style={[styles.badgeText, { color: badgeTone.color }]}>
              {badgeTone.label}
            </Text>
          </View>
        </View>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {formatRange(trip)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.textSecondary,
  },
  sectionCount: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: Radius.lg,
    ...Shadows.sm,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceDim,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardTitle: {
    ...Typography.bodyMed,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  badgeText: {
    ...Typography.micro,
  },
  cardMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  newTripBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primaryLight,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    marginTop: Spacing.lg,
  },
  newTripText: {
    ...Typography.bodyMed,
    color: Colors.primary,
    fontWeight: '700',
  },
});
