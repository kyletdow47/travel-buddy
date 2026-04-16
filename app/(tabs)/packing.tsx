import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SectionList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { PackingItem } from '../../src/types';
import { useTrips } from '../../src/hooks/useTrips';
import { usePacking } from '../../src/hooks/usePacking';
import { useStops } from '../../src/hooks/useStops';
import { usePackingSuggestions } from '../../src/hooks/usePackingSuggestions';
import {
  PackingItemRow,
  PackingItemSeparator,
} from '../../src/components/PackingItemRow';
import { AddPackingItemModal } from '../../src/components/AddPackingItemModal';
import { PackingSuggestionsSheet } from '../../src/components/PackingSuggestionsSheet';
import { AnimatedEnter } from '../../src/components/AnimatedEnter';
import { Skeleton } from '../../src/components/SkeletonLoader';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/constants/theme';
import { haptics } from '../../src/lib/haptics';
import type { PackingSuggestion } from '../../src/services/packingSuggestionService';

const CATEGORY_ORDER = [
  'Clothing',
  'Toiletries',
  'Electronics',
  'Documents',
  'Medicine',
  'Snacks',
  'Gear',
  'Other',
];

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Clothing: 'shirt-outline',
  Toiletries: 'water-outline',
  Electronics: 'laptop-outline',
  Documents: 'document-text-outline',
  Medicine: 'medkit-outline',
  Snacks: 'fast-food-outline',
  Gear: 'fitness-outline',
  Other: 'ellipsis-horizontal-outline',
};

const CATEGORY_COLORS: Record<string, string> = {
  Clothing: '#3AA4FF',
  Toiletries: '#E94A8B',
  Electronics: '#F5B63B',
  Documents: '#8E8E93',
  Medicine: '#22C55E',
  Snacks: '#F2994A',
  Gear: '#5E7891',
  Other: '#C94FBF',
};

type Section = {
  title: string;
  data: PackingItem[];
  packedCount: number;
};

export default function PackingScreen() {
  const { trips, loading: tripsLoading, refresh: refreshTrips } = useTrips();
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  const resolvedTripId = activeTripId ?? trips[0]?.id ?? null;

  const {
    items,
    loading: itemsLoading,
    refresh: refreshItems,
    addItem,
    removeItem,
    toggle,
  } = usePacking(resolvedTripId);

  const { stops } = useStops(resolvedTripId);

  const {
    suggestions,
    loading: suggestionsLoading,
    error: suggestionsError,
    fetchSuggestions,
    clear: clearSuggestions,
  } = usePackingSuggestions();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const loading = tripsLoading || itemsLoading;

  const activeTrip = useMemo(
    () => trips.find((t) => t.id === resolvedTripId) ?? null,
    [trips, resolvedTripId],
  );

  const handleAiSuggest = useCallback(() => {
    if (!activeTrip) return;
    haptics.medium();
    setSuggestionsOpen(true);
    fetchSuggestions(activeTrip, stops, items);
  }, [activeTrip, stops, items, fetchSuggestions]);

  const handleAddSuggestions = useCallback(
    async (selected: PackingSuggestion[]) => {
      if (!resolvedTripId) return;
      for (const item of selected) {
        await addItem({
          trip_id: resolvedTripId,
          name: item.name,
          category: item.category,
          packed: false,
          assigned_to: null,
        });
      }
      haptics.success();
    },
    [resolvedTripId, addItem],
  );

  const handleCloseSuggestions = useCallback(() => {
    setSuggestionsOpen(false);
    clearSuggestions();
  }, [clearSuggestions]);

  const packedCount = useMemo(
    () => items.filter((i) => i.packed).length,
    [items],
  );
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? packedCount / totalCount : 0;

  const sections: Section[] = useMemo(() => {
    const grouped: Record<string, PackingItem[]> = {};
    for (const item of items) {
      const cat = item.category ?? 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    }
    return CATEGORY_ORDER.filter((cat) => grouped[cat] && grouped[cat].length > 0).map(
      (cat) => ({
        title: cat,
        data: grouped[cat],
        packedCount: grouped[cat].filter((i) => i.packed).length,
      }),
    );
  }, [items]);

  const onRefresh = useCallback(async () => {
    await Promise.all([refreshTrips(), refreshItems()]);
  }, [refreshTrips, refreshItems]);

  const handleDelete = useCallback(
    (item: PackingItem) => {
      Alert.alert('Delete item', `Remove "${item.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            haptics.warning();
            await removeItem(item.id);
          },
        },
      ]);
    },
    [removeItem],
  );

  // No trips at all
  if (!tripsLoading && trips.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <FullEmpty />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PackingItemRow
            item={item}
            onToggle={toggle}
            onLongPress={handleDelete}
          />
        )}
        renderSectionHeader={({ section }) => (
          <SectionHeader section={section} />
        )}
        ItemSeparatorComponent={PackingItemSeparator}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        ListHeaderComponent={
          <Header
            trips={trips}
            activeTripId={resolvedTripId}
            setActiveTripId={setActiveTripId}
            packedCount={packedCount}
            totalCount={totalCount}
            progressPercent={progressPercent}
            loading={loading}
          />
        }
        ListEmptyComponent={
          loading && items.length === 0 ? (
            <PackingSkeleton />
          ) : (
            <Empty onAdd={() => setAddModalOpen(true)} />
          )
        }
      />

      {/* AI Suggest FAB */}
      {resolvedTripId && (
        <TouchableOpacity
          style={styles.aiFab}
          activeOpacity={0.85}
          onPress={handleAiSuggest}
        >
          <Ionicons name="sparkles" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Add FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => {
          haptics.medium();
          setAddModalOpen(true);
        }}
      >
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add Packing Item Modal */}
      {resolvedTripId && (
        <AddPackingItemModal
          visible={addModalOpen}
          tripId={resolvedTripId}
          onClose={() => setAddModalOpen(false)}
          onAdd={addItem}
        />
      )}

      {/* AI Suggestions Sheet */}
      <PackingSuggestionsSheet
        visible={suggestionsOpen}
        onClose={handleCloseSuggestions}
        suggestions={suggestions}
        loading={suggestionsLoading}
        error={suggestionsError}
        onAddSelected={handleAddSuggestions}
      />
    </SafeAreaView>
  );
}

// -- Sub-components -----------------------------------------------------------

function Header({
  trips,
  activeTripId,
  setActiveTripId,
  packedCount,
  totalCount,
  progressPercent,
  loading,
}: {
  trips: { id: string; name: string }[];
  activeTripId: string | null;
  setActiveTripId: (id: string) => void;
  packedCount: number;
  totalCount: number;
  progressPercent: number;
  loading: boolean;
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

      {/* Progress card */}
      <AnimatedEnter>
        <View style={styles.statsCard}>
          <View style={styles.statsHeaderRow}>
            <View>
              <Text style={styles.statsLabel}>Packing Progress</Text>
              <Text style={styles.statsAmount}>
                {packedCount}/{totalCount}
              </Text>
            </View>
            <View style={styles.packedBadge}>
              <Ionicons name="cube-outline" size={14} color={Colors.primary} />
              <Text style={styles.packedBadgeText}>
                {totalCount > 0
                  ? `${Math.round(progressPercent * 100)}%`
                  : '0%'}
              </Text>
            </View>
          </View>

          {totalCount > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressPercent * 100}%`,
                      backgroundColor: progressBarColor(progressPercent),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressHint}>
                {packedCount === totalCount
                  ? 'All packed! You are ready to go.'
                  : `${totalCount - packedCount} item${totalCount - packedCount === 1 ? '' : 's'} left to pack`}
              </Text>
            </>
          )}
        </View>
      </AnimatedEnter>
    </View>
  );
}

function SectionHeader({ section }: { section: Section }) {
  const color = CATEGORY_COLORS[section.title] ?? Colors.textTertiary;
  const icon = CATEGORY_ICONS[section.title] ?? 'ellipsis-horizontal-outline';
  const allPacked =
    section.data.length > 0 && section.packedCount === section.data.length;

  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionCount}>
        {section.packedCount}/{section.data.length}
      </Text>
      {allPacked && (
        <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
      )}
    </View>
  );
}

function progressBarColor(percent: number) {
  if (percent >= 1) return Colors.success;
  if (percent >= 0.7) return Colors.primary;
  return Colors.warning;
}

function PackingSkeleton() {
  return (
    <View style={styles.skeletonWrap}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} width="100%" height={52} borderRadius={0} style={styles.skeletonRow} />
      ))}
    </View>
  );
}

function Empty({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name="cube-outline" size={40} color={Colors.textOnCardTertiary} />
      </View>
      <Text style={styles.emptyTitle}>No packing items yet</Text>
      <Text style={styles.emptySubtitle}>
        Start adding items to your packing list so nothing gets left behind.
      </Text>
      <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85} onPress={onAdd}>
        <Ionicons name="add" size={18} color="#FFFFFF" />
        <Text style={styles.ctaButtonText}>Add First Item</Text>
      </TouchableOpacity>
    </View>
  );
}

function FullEmpty() {
  return (
    <View style={styles.fullEmpty}>
      <Ionicons name="cube-outline" size={56} color={Colors.textTertiary} />
      <Text style={styles.fullEmptyTitle}>No trips yet</Text>
      <Text style={styles.fullEmptySubtitle}>
        Create a trip from the Home tab to start your packing list.
      </Text>
    </View>
  );
}

// -- Styles -------------------------------------------------------------------

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
    backgroundColor: Colors.surfaceElevated,
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
    color: '#FFFFFF',
  },

  // Stats card — white card on dark background
  statsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderOnCard,
    ...Shadows.md,
  },
  statsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  statsLabel: {
    ...Typography.caption,
    color: Colors.textOnCardSecondary,
    marginBottom: 2,
  },
  statsAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    lineHeight: 32,
  },
  packedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  packedBadgeText: {
    ...Typography.micro,
    fontWeight: '800',
    color: Colors.primary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.borderOnCard,
    marginVertical: Spacing.md,
  },
  progressTrack: {
    height: 8,
    borderRadius: Radius.xs,
    backgroundColor: Colors.cardSecondary,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.xs,
  },
  progressHint: {
    ...Typography.caption,
    color: Colors.textOnCardSecondary,
    marginTop: Spacing.sm,
  },

  // Section headers — white text on dark navy background
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    flex: 1,
  },
  sectionCount: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '700',
  },

  // Skeleton
  skeletonWrap: {
    gap: 1,
  },
  skeletonRow: {
    marginBottom: 0,
  },

  // Empty state — white card on dark background
  empty: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.borderOnCard,
    borderStyle: 'dashed',
    gap: Spacing.sm,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.textOnCard,
    marginTop: Spacing.xs,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textOnCardSecondary,
    textAlign: 'center',
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
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Full empty (no trips) — white card overlay on dark background
  fullEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.md,
  },
  fullEmptyTitle: {
    ...Typography.h2,
    color: '#FFFFFF',
  },
  fullEmptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // AI Suggest FAB
  aiFab: {
    position: 'absolute',
    bottom: 168,
    right: 28,
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: '#F5B63B',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },

  // FAB — primary action
  fab: {
    position: 'absolute',
    bottom: 100,
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
