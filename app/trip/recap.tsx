import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/constants/theme';

// Defensive require for expo-linear-gradient — falls back to a solid fill.
type LinearGradientComponent = React.ComponentType<{
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: unknown;
  children?: React.ReactNode;
}>;
let LinearGradient: LinearGradientComponent | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  LinearGradient = require('expo-linear-gradient').LinearGradient ?? null;
} catch {
  LinearGradient = null;
}
import { haptics } from '../../src/lib/haptics';
import { supabase } from '../../src/lib/supabase';
import { useStops } from '../../src/hooks/useStops';
import { useReceipts } from '../../src/hooks/useReceipts';
import type { Trip, Stop } from '../../src/types';

export default function RecapScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loadingTrip, setLoadingTrip] = useState(true);
  const { stops, loading: loadingStops } = useStops(tripId ?? null);
  const { receipts, loading: loadingReceipts } = useReceipts(tripId ?? null);

  useEffect(() => {
    if (!tripId) return;
    setLoadingTrip(true);
    (async () => {
      try {
        const { data } = await supabase
          .from('trips')
          .select('*')
          .eq('id', tripId)
          .single();
        setTrip(data as Trip | null);
      } catch {
        // ignore
      } finally {
        setLoadingTrip(false);
      }
    })();
  }, [tripId]);

  const stats = useMemo(() => {
    // Total days
    let totalDays = 0;
    if (trip?.start_date && trip?.end_date) {
      const start = new Date(trip.start_date);
      const end = new Date(trip.end_date);
      totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    }

    // Stops visited (status === 'done' or all stops)
    const stopsVisited = stops.filter((s) => s.status === 'done').length || stops.length;

    // Unique countries — approximate from stop locations
    const countries = new Set<string>();
    for (const s of stops) {
      if (s.location) {
        // Use the last comma-separated part as a rough country proxy
        const parts = s.location.split(',');
        const last = parts[parts.length - 1]?.trim();
        if (last) countries.add(last);
      }
    }

    // Total spent
    const totalSpent = receipts.reduce((sum, r) => sum + (r.amount ?? 0), 0);

    return { totalDays, stopsVisited, countries: countries.size || 1, totalSpent };
  }, [trip, stops, receipts]);

  // Top 3 stops by category diversity (stops with most unique categories around them)
  const highlights = useMemo(() => {
    const catMap = new Map<string, Set<string>>();
    for (const s of stops) {
      const cat = s.category ?? 'other';
      for (const other of stops) {
        if (other.id !== s.id) {
          const set = catMap.get(s.id) ?? new Set<string>();
          set.add(other.category ?? 'other');
          catMap.set(s.id, set);
        }
      }
      // Also add own category
      const set = catMap.get(s.id) ?? new Set<string>();
      set.add(cat);
      catMap.set(s.id, set);
    }

    return stops
      .slice()
      .sort((a, b) => (catMap.get(b.id)?.size ?? 0) - (catMap.get(a.id)?.size ?? 0))
      .slice(0, 3);
  }, [stops]);

  const handleShare = useCallback(() => {
    haptics.medium();
    Alert.alert('Share Recap', 'Sharing will be available in a future update.');
  }, []);

  const loading = loadingTrip || loadingStops || loadingReceipts;

  if (loading) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  const dateRange = formatDateRange(trip?.start_date, trip?.end_date);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Hero section */}
      {LinearGradient ? (
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Ionicons name="airplane" size={40} color="rgba(255,255,255,0.3)" style={styles.heroIcon} />
          <Text style={styles.heroTitle}>{trip?.name ?? 'Trip Recap'}</Text>
          <Text style={styles.heroSubtitle}>{dateRange}</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.hero, { backgroundColor: Colors.primary }]}>
          <Ionicons name="airplane" size={40} color="rgba(255,255,255,0.3)" style={styles.heroIcon} />
          <Text style={styles.heroTitle}>{trip?.name ?? 'Trip Recap'}</Text>
          <Text style={styles.heroSubtitle}>{dateRange}</Text>
        </View>
      )}

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <StatBox label="Total Days" value={String(stats.totalDays)} icon="calendar-outline" />
        <StatBox label="Stops Visited" value={String(stats.stopsVisited)} icon="pin-outline" />
        <StatBox label="Countries" value={String(stats.countries)} icon="globe-outline" />
        <StatBox
          label="Total Spent"
          value={`$${stats.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          icon="wallet-outline"
        />
      </View>

      {/* Highlights */}
      {highlights.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          {highlights.map((stop, i) => (
            <HighlightRow key={stop.id} stop={stop} index={i} />
          ))}
        </View>
      ) : null}

      {/* Share button */}
      <TouchableOpacity
        style={styles.shareButton}
        activeOpacity={0.85}
        onPress={handleShare}
      >
        <Ionicons name="share-outline" size={20} color="#FFFFFF" />
        <Text style={styles.shareText}>Share Recap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}) {
  return (
    <View style={styles.statBox}>
      <Ionicons name={icon} size={20} color={Colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function HighlightRow({ stop, index }: { stop: Stop; index: number }) {
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <View style={styles.highlightRow}>
      <Text style={styles.highlightMedal}>{medals[index] ?? ''}</Text>
      <View style={styles.highlightInfo}>
        <Text style={styles.highlightName} numberOfLines={1}>
          {stop.name}
        </Text>
        {stop.location ? (
          <Text style={styles.highlightLocation} numberOfLines={1}>
            {stop.location}
          </Text>
        ) : null}
      </View>
      <Text style={styles.highlightCategory}>{stop.category ?? 'other'}</Text>
    </View>
  );
}

function formatDateRange(start: string | null | undefined, end: string | null | undefined): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  if (start && end) {
    return `${new Date(start).toLocaleDateString('en-US', opts)} - ${new Date(end).toLocaleDateString('en-US', opts)}`;
  }
  if (start) return new Date(start).toLocaleDateString('en-US', opts);
  return 'No dates set';
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: Spacing.xxxl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },

  // Hero
  hero: {
    paddingTop: 80,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  heroIcon: {
    marginBottom: Spacing.md,
  },
  heroTitle: {
    ...Typography.display,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heroSubtitle: {
    ...Typography.bodyMed,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    marginTop: -Spacing.lg,
    gap: Spacing.md,
  },
  statBox: {
    width: '47%',
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderOnCard,
    ...Shadows.sm,
  },
  statValue: {
    ...Typography.h1,
    color: Colors.textOnCard,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textOnCardSecondary,
  },

  // Section
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  // Highlight row
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderOnCard,
    ...Shadows.sm,
  },
  highlightMedal: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  highlightInfo: {
    flex: 1,
    gap: 2,
  },
  highlightName: {
    ...Typography.bodyMed,
    fontWeight: '700',
    color: Colors.textOnCard,
  },
  highlightLocation: {
    ...Typography.caption,
    color: Colors.textOnCardSecondary,
  },
  highlightCategory: {
    ...Typography.micro,
    color: Colors.textOnCardTertiary,
    textTransform: 'capitalize',
  },

  // Share button
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xxl,
    ...Shadows.md,
  },
  shareText: {
    ...Typography.bodyMed,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
