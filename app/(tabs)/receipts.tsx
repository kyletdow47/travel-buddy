import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Trip, Receipt } from '../../src/types';
import {
  ReceiptRow,
  ReceiptSeparator,
  normalizeReceiptCategory,
} from '../../src/components/ReceiptRow';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/constants/theme';

const MOCK_TRIPS: Trip[] = [];
const MOCK_RECEIPTS: Receipt[] = [];

type FilterCategory = 'All' | 'Food' | 'Hotel' | 'Gas' | 'Activity' | 'Other';
const FILTERS: FilterCategory[] = ['All', 'Food', 'Hotel', 'Gas', 'Activity', 'Other'];

const CATEGORY_COLORS: Record<Exclude<FilterCategory, 'All'>, string> = {
  Food: Colors.category.food,
  Hotel: Colors.category.hotel,
  Gas: Colors.category.gas,
  Activity: Colors.category.activity,
  Other: Colors.category.other,
};

const CATEGORY_ICONS: Record<Exclude<FilterCategory, 'All'>, keyof typeof Ionicons.glyphMap> = {
  Food: 'restaurant-outline',
  Hotel: 'bed-outline',
  Gas: 'car-outline',
  Activity: 'bicycle-outline',
  Other: 'pricetag-outline',
};

function budgetBarColor(percent: number) {
  if (percent >= 0.95) return Colors.error;
  if (percent >= 0.8) return Colors.warning;
  return Colors.primary;
}

function budgetRemainingColor(remaining: number) {
  return remaining >= 0 ? Colors.success : Colors.error;
}

export default function ReceiptsScreen() {
  const [trips] = useState<Trip[]>(MOCK_TRIPS);
  const [receipts] = useState<Receipt[]>(MOCK_RECEIPTS);
  const [activeTripId, setActiveTripId] = useState<string | null>(trips[0]?.id ?? null);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('All');

  const activeTrip = useMemo(
    () => trips.find((t) => t.id === activeTripId) ?? null,
    [trips, activeTripId],
  );

  const tripReceipts = useMemo(
    () => (activeTripId ? receipts.filter((r) => r.trip_id === activeTripId) : []),
    [receipts, activeTripId],
  );

  const totalSpent = useMemo(
    () => tripReceipts.reduce((sum, r) => sum + (r.amount ?? 0), 0),
    [tripReceipts],
  );

  const budget = activeTrip?.budget ?? 0;
  const remaining = budget - totalSpent;
  const percent = budget > 0 ? Math.min(1, totalSpent / budget) : 0;

  // Category totals + counts
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; count: number }> = {};
    tripReceipts.forEach((r) => {
      const key = normalizeReceiptCategory(r.category);
      if (!stats[key]) stats[key] = { total: 0, count: 0 };
      stats[key].total += r.amount ?? 0;
      stats[key].count += 1;
    });
    return stats;
  }, [tripReceipts]);

  const filteredReceipts = useMemo(() => {
    if (activeFilter === 'All') return tripReceipts;
    const needle = activeFilter.toLowerCase();
    return tripReceipts.filter(
      (r) => normalizeReceiptCategory(r.category) === needle,
    );
  }, [tripReceipts, activeFilter]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={filteredReceipts}
        keyExtractor={(r) => String(r.id)}
        renderItem={({ item }) => <ReceiptRow receipt={item} />}
        ItemSeparatorComponent={ReceiptSeparator}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Header
            trips={trips}
            activeTripId={activeTripId}
            setActiveTripId={setActiveTripId}
            totalSpent={totalSpent}
            budget={budget}
            remaining={remaining}
            percent={percent}
            categoryStats={categoryStats}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
        }
        ListEmptyComponent={<Empty hasReceipts={tripReceipts.length > 0} />}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Ionicons name="add" size={26} color={Colors.surface} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function Header({
  trips,
  activeTripId,
  setActiveTripId,
  totalSpent,
  budget,
  remaining,
  percent,
  categoryStats,
  activeFilter,
  setActiveFilter,
}: {
  trips: Trip[];
  activeTripId: string | null;
  setActiveTripId: (id: string) => void;
  totalSpent: number;
  budget: number;
  remaining: number;
  percent: number;
  categoryStats: Record<string, { total: number; count: number }>;
  activeFilter: FilterCategory;
  setActiveFilter: (f: FilterCategory) => void;
}) {
  return (
    <View>
      {/* Trip selector */}
      {trips.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectorRow}
        >
          {trips.map((trip) => {
            const active = trip.id === activeTripId;
            return (
              <TouchableOpacity
                key={trip.id}
                activeOpacity={0.85}
                style={[styles.selectorChip, active && styles.selectorChipActive]}
                onPress={() => setActiveTripId(trip.id)}
              >
                <Text
                  style={[
                    styles.selectorText,
                    active && styles.selectorTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {trip.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Stats card */}
      <View style={styles.statsCard}>
        <View style={styles.statsHeaderRow}>
          <Text style={styles.statsLabel}>Total Spent</Text>
          <Text style={styles.statsAmount}>${totalSpent.toFixed(2)}</Text>
        </View>

        {budget > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.statsMetaRow}>
              <Text style={styles.statsMetaText}>Budget: ${budget.toLocaleString()}</Text>
              <Text style={[styles.statsMetaText, { color: Colors.textSecondary }]}>
                {Math.round(percent * 100)}%
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${percent * 100}%`, backgroundColor: budgetBarColor(percent) },
                ]}
              />
            </View>
            <Text
              style={[
                styles.remaining,
                { color: budgetRemainingColor(remaining) },
              ]}
            >
              {remaining >= 0
                ? `Remaining: $${remaining.toFixed(2)}`
                : `Over by $${Math.abs(remaining).toFixed(2)}`}
            </Text>
          </>
        )}

        {Object.keys(categoryStats).length > 0 && (
          <>
            <View style={styles.divider} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.breakdownRow}
            >
              {Object.entries(categoryStats).map(([cat, stat]) => {
                const capKey = (cat.charAt(0).toUpperCase() + cat.slice(1)) as
                  | Exclude<FilterCategory, 'All'>;
                const color = CATEGORY_COLORS[capKey] ?? Colors.category.other;
                const icon = CATEGORY_ICONS[capKey] ?? 'pricetag-outline';
                return (
                  <View
                    key={cat}
                    style={[
                      styles.breakdownChip,
                      { borderLeftColor: color },
                    ]}
                  >
                    <Ionicons name={icon} size={14} color={color} />
                    <View>
                      <Text style={styles.breakdownCategory}>{capKey}</Text>
                      <Text style={styles.breakdownAmount}>
                        ${stat.total.toFixed(0)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </>
        )}
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((filter) => {
          const active = activeFilter === filter;
          const key = filter.toLowerCase();
          const count =
            filter === 'All'
              ? Object.values(categoryStats).reduce((s, v) => s + v.count, 0)
              : categoryStats[key]?.count ?? 0;
          if (filter !== 'All' && count === 0) return null;
          return (
            <TouchableOpacity
              key={filter}
              activeOpacity={0.85}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  active && styles.filterChipTextActive,
                ]}
              >
                {filter}
                {count > 0 ? ` (${count})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function Empty({ hasReceipts }: { hasReceipts: boolean }) {
  if (hasReceipts) {
    return (
      <View style={styles.emptyInline}>
        <Text style={styles.emptyInlineText}>No receipts in this category</Text>
      </View>
    );
  }
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name="receipt-outline" size={40} color={Colors.textTertiary} />
      </View>
      <Text style={styles.emptyTitle}>No receipts yet</Text>
      <Text style={styles.emptySubtitle}>
        Track your spending by adding receipts as you travel.
      </Text>
      <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
        <Ionicons name="add" size={18} color={Colors.surface} />
        <Text style={styles.ctaButtonText}>Add First Receipt</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: 100,
  },

  // Trip selector
  selectorRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  selectorChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: 200,
  },
  selectorChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  selectorText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  selectorTextActive: {
    color: Colors.surface,
  },

  // Stats card
  statsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  statsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  statsLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  statsAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    lineHeight: 32,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  statsMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statsMetaText: {
    ...Typography.caption,
    color: Colors.text,
  },
  progressTrack: {
    height: 8,
    borderRadius: Radius.xs,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.xs,
  },
  remaining: {
    ...Typography.caption,
    marginTop: Spacing.sm,
    fontWeight: '600',
  },
  breakdownRow: {
    gap: Spacing.sm,
    paddingRight: Spacing.xs,
  },
  breakdownChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderLeftWidth: 4,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  breakdownCategory: {
    ...Typography.micro,
    color: Colors.textSecondary,
  },
  breakdownAmount: {
    ...Typography.bodyMed,
    fontWeight: '700',
    color: Colors.text,
  },

  // Filter chips
  filterRow: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.surface,
  },

  // Empty state
  empty: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  emptyInline: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyInlineText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.full,
    ...Shadows.sm,
  },
  ctaButtonText: {
    ...Typography.bodyMed,
    color: Colors.surface,
    fontWeight: '700',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
});
