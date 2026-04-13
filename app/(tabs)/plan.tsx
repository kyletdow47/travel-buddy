import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useTrips } from '../../src/hooks/useTrips';
import { useStops } from '../../src/hooks/useStops';
import { useDarkColors } from '../../src/hooks/useDarkColors';
import { StopRow } from '../../src/components/StopRow';
import { SkeletonStopRow } from '../../src/components/SkeletonLoader';
import { EmptyState } from '../../src/components/EmptyState';
import { deleteStop, updateStopStatus } from '../../src/services/stopsService';
import { Colors, Spacing, Typography, Radius } from '../../src/constants/theme';
import type { Stop } from '../../src/types';

export default function PlanScreen() {
  const colors = useDarkColors();
  const { trips, loading: tripsLoading } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const activeTripId = selectedTripId ?? trips[0]?.id ?? null;
  const { stops, loading: stopsLoading, refetch: refetchStops } = useStops(activeTripId);

  async function handleDeleteStop(stop: Stop) {
    Alert.alert('Delete Stop', `Delete "${stop.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deleteStop(stop.id);
            await refetchStops();
            Toast.show({ type: 'success', text1: 'Stop deleted' });
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to delete stop' });
          }
        },
      },
    ]);
  }

  async function handleStatusChange(id: string, status: 'upcoming' | 'current' | 'done') {
    try {
      await Haptics.selectionAsync();
      await updateStopStatus(id, status);
      await refetchStops();
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update status' });
    }
  }

  function handleSelectTrip(tripId: string) {
    Haptics.selectionAsync();
    setSelectedTripId(tripId);
  }

  const isLoading = tripsLoading || stopsLoading;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Plan</Text>
      </View>

      {trips.length > 0 && (
        <View style={[styles.tripSelectorWrapper, { borderBottomColor: colors.border }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tripSelector}
          >
            {trips.map((trip) => {
              const isSelected = trip.id === activeTripId;
              return (
                <TouchableOpacity
                  key={trip.id}
                  style={[
                    styles.tripChip,
                    { borderColor: colors.border, backgroundColor: colors.backgroundSecondary },
                    isSelected && styles.tripChipSelected,
                  ]}
                  onPress={() => handleSelectTrip(trip.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.tripChipText,
                      { color: colors.textSecondary },
                      isSelected && styles.tripChipTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {trip.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {isLoading ? (
        <View>
          {[1, 2, 3, 4].map((i) => <SkeletonStopRow key={i} />)}
        </View>
      ) : (
        <FlatList
          data={stops}
          keyExtractor={(item) => item.id}
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={stopsLoading}
              onRefresh={refetchStops}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={stops.length === 0 ? styles.emptyContainer : styles.listContent}
          ListEmptyComponent={
            trips.length === 0 ? (
              <EmptyState
                icon="airplane"
                title="No trips yet"
                subtitle="Create a trip from the Home tab first"
              />
            ) : (
              <EmptyState
                icon="list"
                title="No stops added"
                subtitle="Add stops to build your itinerary"
              />
            )
          }
          renderItem={({ item }) => (
            <StopRow
              stop={item}
              colors={colors}
              onDelete={() => handleDeleteStop(item)}
              onStatusChange={handleStatusChange}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
  },
  tripSelectorWrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tripSelector: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  tripChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    maxWidth: 180,
  },
  tripChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tripChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tripChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  emptyContainer: {
    flex: 1,
  },
});
