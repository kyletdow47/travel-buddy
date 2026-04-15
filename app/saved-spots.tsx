import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSavedSpots } from '../src/hooks/useSavedSpots';
import { SavedSpotCard } from '../src/components/SavedSpotCard';
import { ImportUrlModal } from '../src/components/ImportUrlModal';
import { Colors, Typography, Spacing, Radius, Shadows } from '../src/constants/theme';
import { haptics } from '../src/lib/haptics';

type FilterKey = 'all' | 'instagram' | 'tiktok' | 'google' | 'manual';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'google', label: 'Google' },
  { key: 'manual', label: 'Manual' },
];

export default function SavedSpotsScreen() {
  const router = useRouter();
  const { spots, loading, refresh, addSpot, removeSpot } = useSavedSpots();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [importVisible, setImportVisible] = useState(false);

  const fabScale = useMemo(() => new Animated.Value(1), []);

  const filteredSpots = useMemo(() => {
    if (filter === 'all') return spots;
    return spots.filter((s) => (s.source_platform ?? 'manual').toLowerCase() === filter);
  }, [spots, filter]);

  const handleDelete = useCallback(
    (spotId: string, spotName: string) => {
      Alert.alert('Delete spot', `Remove "${spotName}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            haptics.warning();
            await removeSpot(spotId);
          },
        },
      ]);
    },
    [removeSpot],
  );

  const handleImport = useCallback(
    (spotId: string) => {
      // TODO: Show trip picker to select which trip to import into
      haptics.light();
      Alert.alert('Coming soon', 'Trip selection will be available in a future update.');
    },
    [],
  );

  const onFabPress = useCallback(() => {
    haptics.light();
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.spring(fabScale, { toValue: 1, useNativeDriver: true, damping: 10 }),
    ]).start();
    setImportVisible(true);
  }, [fabScale]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Spots</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map(({ key, label }) => {
            const active = filter === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.chip, active && styles.chipActive]}
                activeOpacity={0.85}
                onPress={() => {
                  haptics.selection();
                  setFilter(key);
                }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Content */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.primary} />
          }
        >
          {filteredSpots.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="share-outline" size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>Save spots from social media</Text>
              <Text style={styles.emptyBody}>
                Import places from Instagram, TikTok, or Google Maps to plan your trips.
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {filteredSpots.map((spot) => (
                <View key={spot.id} style={styles.gridItem}>
                  <SavedSpotCard
                    spot={spot}
                    onImport={() => handleImport(spot.id)}
                    onDelete={() => handleDelete(spot.id, spot.name)}
                  />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Import FAB */}
      <Animated.View
        style={[styles.fab, { transform: [{ scale: fabScale }] }]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.fabButton}
          onPress={onFabPress}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Import URL Modal */}
      <ImportUrlModal
        visible={importVisible}
        onClose={() => setImportVisible(false)}
        onImport={addSpot}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  headerSpacer: {
    width: 24,
  },

  // Filter chips
  filterRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadows.sm,
  },
  chipText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxxl + 60,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  gridItem: {
    width: '47%',
    flexGrow: 1,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text,
    textAlign: 'center',
  },
  emptyBody: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 24,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
});
