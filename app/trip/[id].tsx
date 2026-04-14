import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../../src/lib/supabase';
import type { Trip, Stop } from '../../src/types';
import { Colors, Radius, Shadows, Spacing, Typography } from '../../src/constants/theme';
import { HeroPhotoHeader } from '../../src/components/HeroPhotoHeader';
import { TripHeaderMeta } from '../../src/components/TripHeaderMeta';
import { TripQuickActionRow, type TripQuickAction } from '../../src/components/TripQuickActionRow';
import { UnsplashCoverPicker } from '../../src/components/UnsplashCoverPicker';
import { TripActionSheet } from '../../src/components/TripActionSheet';
import { CategoryGlyph } from '../../src/components/CategoryGlyph';
import type { PhotoAttribution } from '../../src/lib/unsplash';

export default function TripHomeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [{ data: tripData }, { data: stopsData }] = await Promise.all([
      supabase.from('trips').select('*').eq('id', id).single(),
      supabase.from('stops').select('*').eq('trip_id', id).order('sort_order'),
    ]);
    setTrip(tripData as Trip | null);
    setStops((stopsData as Stop[]) ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onCoverChosen = useCallback(
    async (url: string, attribution: PhotoAttribution) => {
      if (!trip) return;
      const { data, error } = await supabase
        .from('trips')
        .update({
          cover_photo_url: url,
          cover_photo_attribution: JSON.stringify(attribution),
        })
        .eq('id', trip.id)
        .select()
        .single();
      if (error) {
        Alert.alert('Cover not saved', error.message);
        return;
      }
      setTrip(data as Trip);
    },
    [trip],
  );

  const grouped = useMemo(() => {
    const byCat = new Map<string, Stop[]>();
    for (const s of stops) {
      const key = s.category ?? 'other';
      const arr = byCat.get(key) ?? [];
      arr.push(s);
      byCat.set(key, arr);
    }
    return Array.from(byCat.entries());
  }, [stops]);

  const handleQuickAction = useCallback(
    (a: TripQuickAction) => {
      // TODO: route to category-specific create flows once those screens
      // land. For now, open the generic /plan editor with a category hint.
      router.push({ pathname: '/plan', params: { trip: trip?.id ?? '', category: a } });
    },
    [router, trip?.id],
  );

  if (loading || !trip) {
    return (
      <View style={styles.loading}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  const cover = (trip as Trip & { cover_photo_url?: string | null }).cover_photo_url;
  const flag = (trip as Trip & { country_flag?: string | null }).country_flag;
  const countryCode = (trip as Trip & { country_code?: string | null }).country_code;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={[0]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <HeroPhotoHeader
        source={cover ? { uri: cover } : null}
        title={trip.name}
        eyebrow={trip.status ? trip.status.toUpperCase() : 'TRIP'}
        onBack={() => router.back()}
        actionIcon="ellipsis-horizontal"
        onActionPress={() => setActionSheetOpen(true)}
        height={340}
      >
        <View style={{ marginTop: Spacing.xs }}>
          <TripHeaderMeta
            flag={flag}
            countryCode={countryCode}
            startDate={trip.start_date}
            endDate={trip.end_date}
          />
        </View>
        <Pressable
          onPress={() => setCoverPickerOpen(true)}
          style={({ pressed }) => [
            styles.coverBtn,
            pressed ? { opacity: 0.85 } : null,
          ]}
        >
          <Ionicons name="image-outline" size={14} color="#FFFFFF" />
          <Text style={styles.coverBtnText}>
            {cover ? 'Change cover' : 'Pick cover'}
          </Text>
        </Pressable>
      </HeroPhotoHeader>

      {/* Frosted Organizer sheet — pulled up over the hero */}
      <View style={styles.organizer}>
        <View style={styles.handle} />

        <Text style={[Typography.eyebrow, styles.organizerEyebrow]}>Organizer</Text>

        <TripQuickActionRow onAction={handleQuickAction} />

        {grouped.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptyText}>
              Tap a quick-action above to add your first flight, lodging, or place.
            </Text>
          </View>
        ) : (
          grouped.map(([cat, items]) => (
            <View key={cat} style={styles.group}>
              <View style={styles.groupHead}>
                <CategoryGlyph category={cat} size={28} />
                <Text style={styles.groupTitle}>{prettyCategory(cat)}</Text>
                <Text style={styles.groupCount}>{items.length}</Text>
              </View>
              {items.map((s) => (
                <View key={s.id} style={styles.stopRow}>
                  <Text style={styles.stopName} numberOfLines={1}>
                    {s.name}
                  </Text>
                  {s.planned_date ? (
                    <Text style={styles.stopDate}>
                      {new Date(s.planned_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          ))
        )}
      </View>

      <UnsplashCoverPicker
        visible={coverPickerOpen}
        onClose={() => setCoverPickerOpen(false)}
        onSelect={onCoverChosen}
        initialQuery={trip.name}
      />

      <TripActionSheet
        trip={trip}
        visible={actionSheetOpen}
        onClose={() => setActionSheetOpen(false)}
        onChanged={({ kind, trip: next }) => {
          if (kind === 'delete') router.back();
          else if (next) setTrip(next);
        }}
      />
    </ScrollView>
  );
}

function prettyCategory(raw: string): string {
  if (!raw) return 'Other';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: Spacing.xxxl,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  coverBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  coverBtnText: {
    ...Typography.micro,
    color: '#FFFFFF',
  },
  organizer: {
    marginTop: -Radius.sheet,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    ...Shadows.sheet,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginBottom: Spacing.md,
  },
  organizerEyebrow: {
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  group: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  groupTitle: {
    ...Typography.h3,
    color: Colors.text,
    flex: 1,
  },
  groupCount: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    marginBottom: Spacing.xs,
    ...Shadows.sm,
  },
  stopName: {
    ...Typography.bodyMed,
    color: Colors.text,
    flex: 1,
  },
  stopDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  emptyBlock: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  emptyText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
