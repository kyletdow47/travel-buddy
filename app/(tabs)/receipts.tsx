import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Receipt } from '../../src/types';
import { useTrips } from '../../src/hooks/useTrips';
import { useReceipts } from '../../src/hooks/useReceipts';
import {
  ReceiptRow,
  ReceiptSeparator,
  normalizeReceiptCategory,
} from '../../src/components/ReceiptRow';
import { AddReceiptModal } from '../../src/components/AddReceiptModal';
import { ReceiptDetailSheet } from '../../src/components/ReceiptDetailSheet';
import { AnimatedEnter } from '../../src/components/AnimatedEnter';
import { Skeleton } from '../../src/components/SkeletonLoader';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/constants/theme';
import { haptics } from '../../src/lib/haptics';

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
  const { trips, loading: tripsLoading, refresh: refreshTrips } = useTrips();
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  const resolvedTripId = activeTripId ?? trips[0]?.id ?? null;
  const activeTrip = useMemo(
    () => trips.find((t) => t.id === resolvedTripId) ?? null,
    [trips, resolvedTripId],
  );

  const {
    receipts,
    loading: receiptsLoading,
    refresh: refreshReceipts,
    addReceipt,
    removeReceipt,
  } = useReceipts(resolvedTripId);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('All');

  const totalSpent = useMemo(
    () => receipts.reduce((sum, r) => sum + (r.amount ?? 0), 0),
    [receipts],
  );

  const budget = activeTrip?.budget ?? 0;
  const remaining = budget - totalSpent;
  const percent = budget > 0 ? Math.min(1, totalSpent / budget) : 0;

  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; count: number }> = {};
    receipts.forEach((r) => {
      const key = normalizeReceiptCategory(r.category);
      if (!stats[key]) stats[key] = { total: 0, count: 0 };
      stats[key].total += r.amount ?? 0;
      stats[key].count += 1;
    });
    return stats;
  }, [receipts]);

  const filteredReceipts = useMemo(() => {
    if (activeFilter === 'All') return receipts;
    const needle = activeFilter.toLowerCase();
    return receipts.filter(
      (r) => normalizeReceiptCategory(r.category) === needle,
    );
  }, [receipts, activeFilter]);

  const loading = tripsLoading || receiptsLoading;

  const onRefresh = useCallback(async () => {
    await Promise.all([refreshTrips(), refreshReceipts()]);
  }, [refreshTrips, refreshReceipts]);

  const handleDelete = useCallback(
    (receipt: Receipt) => {
      Alert.alert('Delete receipt', `Remove "${receipt.merchant}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            haptics.warning();
            setSelectedReceipt(null);
            await removeReceipt(receipt.id);
          },
        },
      ]);
    },
    [removeReceipt],
  );

  // ── No trips at all
  if (!tripsLoading && trips.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <FullEmpty />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={filteredReceipts}
        keyExtractor={(r) => String(r.id)}
        renderItem={({ item, index }) => (
          <AnimatedEnter delay={index * 40}>
            <ReceiptRow
              receipt={item}
              onPress={() => {
                haptics.selection();
                setSelectedReceipt(item);
              }}
            />
          </AnimatedEnter>
        )}
        ItemSeparatorComponent={ReceiptSeparator}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListHeaderComponent={
          <Header
            trips={trips}
            activeTripId={resolvedTripId}
            setActiveTripId={setActiveTripId}
            totalSpent={totalSpent}
            budget={budget}
            remaining={remaining}
            percent={percent}
            categoryStats={categoryStats}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            loading={loading}
            receiptCount={receipts.length}
          />
        }
        ListEmptyComponent={
          loading && receipts.length === 0 ? (
            <ReceiptsSkeleton />
          ) : (
            <Empty
              hasReceipts={receipts.length > 0}
              onAdd={() => setAddModalOpen(true)}
            />
          )
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => {
          haptics.medium();
          setAddModalOpen(true);
        }}
      >
        <Ionicons name="add" size={26} color={Colors.surface} />
      </TouchableOpacity>

      {/* Add Receipt Modal */}
      {resolvedTripId && (
        <AddReceiptModal
          visible={addModalOpen}
          tripId={resolvedTripId}
          onClose={() => setAddModalOpen(false)}
          onAdd={addReceipt}
        />
      )}

      {/* Receipt Detail Sheet */}
      <ReceiptDetailSheet
        receipt={selectedReceipt}
        visible={selectedReceipt !== null}
        onClose={() => setSelectedReceipt(null)}
        onEdit={() => {
          // TODO: open EditReceiptModal
          setSelectedReceipt(null);
        }}
        onDelete={selectedReceipt ? () => handleDelete(selectedReceipt) : undefined}
      />
    </SafeAreaView>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

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
  loading,
  receiptCount,
}: {
  trips: { id: string; name: string }[];
  activeTripId: string | null;
  setActiveTripId: (id: string) => void;
  totalSpent: number;
  budget: number;
  remaining: number;
  percent: number;
  categoryStats: Record<string, { total: number; count: number }>;
  activeFilter: FilterCategory;
  setActiveFilter: (f: FilterCategory) => void;
  loading: boolean;
  receiptCount: number;
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
                onPress={() => {
                  haptics.selection();
                  setActiveTripId(trip.id);
                }}
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
      <AnimatedEnter>
        <View style={styles.statsCard}>
          <View style={styles.statsHeaderRow}>
            <View>
              <Text style={styles.statsLabel}>Total Spent</Text>
              <Text style={styles.statsAmount}>${totalSpent.toFixed(2)}</Text>
            </View>
            <View style={styles.receiptCountBadge}>
              <Ionicons name="receipt-outline" size={14} color={Colors.primary} />
              <Text style={styles.receiptCountText}>{receiptCount}</Text>
            </View>
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
      </AnimatedEnter>

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
              onPress={() => {
                haptics.selection();
                setActiveFilter(filter);
              }}
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

function ReceiptsSkeleton() {
  return (
    <View style={styles.skeletonWrap}>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} width="100%" height={64} borderRadius={0} style={styles.skeletonRow} />
      ))}
    </View>
  );
}

function Empty({ hasReceipts, onAdd }: { hasReceipts: boolean; onAdd: () => void }) {
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
      <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85} onPress={onAdd}>
        <Ionicons name="add" size={18} color={Colors.surface} />
        <Text style={styles.ctaButtonText}>Add First Receipt</Text>
      </TouchableOpacity>
    </View>
  );
}

function FullEmpty() {
  return (
    <View style={styles.fullEmpty}>
      <Ionicons name="wallet-outline" size={56} color={Colors.textTertiary} />
      <Text style={styles.fullEmptyTitle}>No trips yet</Text>
      <Text style={styles.fullEmptySubtitle}>
        Create a trip from the Home tab to start tracking expenses.
      </Text>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  selectorChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
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
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  statsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  statsLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  statsAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    lineHeight: 32,
  },
  receiptCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  receiptCountText: {
    ...Typography.micro,
    fontWeight: '800',
    color: Colors.primary,
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
    borderWidth: 1.5,
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

  // Skeleton
  skeletonWrap: {
    gap: 1,
  },
  skeletonRow: {
    marginBottom: 0,
  },

  // Empty state
  empty: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    gap: Spacing.sm,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
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
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
    ...Shadows.sm,
  },
  ctaButtonText: {
    ...Typography.bodyMed,
    color: Colors.surface,
    fontWeight: '700',
  },

  // Full empty (no trips)
  fullEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.md,
  },
  fullEmptyTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  fullEmptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
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
