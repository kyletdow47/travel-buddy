import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme';
import { useTrips } from '../../src/hooks/useTrips';
import { TripCard } from '../../src/components/TripCard';
import { ActiveTripBanner } from '../../src/components/ActiveTripBanner';
import { CreateTripModal, type LocationStop } from '../../src/components/CreateTripModal';
import { EditTripModal } from '../../src/components/EditTripModal';
import { createStop } from '../../src/services/stopsService';
import type { Trip, TripInsert } from '../../src/types';

export default function HomeScreen() {
  const { trips, loading, error, refresh, addTrip, editTrip, removeTrip } = useTrips();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const activeTrip = trips.find((t) => t.status === 'active') ?? null;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleCreateSave = useCallback(
    async (trip: TripInsert, locations: LocationStop[]) => {
      const created = await addTrip(trip);
      // Create stops for start point, waypoints, and end point
      for (const loc of locations) {
        await createStop({
          trip_id: created.id,
          name: loc.name,
          category: loc.category,
          sort_order: loc.sort_order,
          status: 'upcoming',
        });
      }
      setCreateModalVisible(false);
    },
    [addTrip]
  );

  const handleEdit = useCallback((trip: Trip) => {
    setEditingTrip(trip);
    setEditModalVisible(true);
  }, []);

  const handleEditSave = useCallback(
    async (id: string, updates: Partial<TripInsert>) => {
      await editTrip(id, updates);
      setEditModalVisible(false);
      setEditingTrip(null);
    },
    [editTrip]
  );

  const handleEditClose = useCallback(() => {
    setEditModalVisible(false);
    setEditingTrip(null);
  }, []);

  const handleDelete = useCallback(
    async (trip: Trip) => {
      try {
        await removeTrip(trip.id);
      } catch (err) {
        // Error already thrown, TripCard handles the alert flow
      }
    },
    [removeTrip]
  );

  const renderItem = useCallback(
    ({ item }: { item: Trip }) => (
      <TripCard trip={item} onEdit={handleEdit} onDelete={handleDelete} />
    ),
    [handleEdit, handleDelete]
  );

  const keyExtractor = useCallback((item: Trip) => item.id, []);

  const renderHeader = useCallback(() => {
    return (
      <View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>My Trips</Text>
          <Text style={styles.tripCount}>
            {trips.length} trip{trips.length !== 1 ? 's' : ''}
          </Text>
        </View>
        {activeTrip && <ActiveTripBanner trip={activeTrip} />}
      </View>
    );
  }, [activeTrip, trips.length]);

  const renderEmpty = useCallback(() => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="airplane-outline" size={48} color={Colors.border} />
        <Text style={styles.emptyTitle}>No trips yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the + button to plan your first adventure
        </Text>
      </View>
    );
  }, [loading]);

  if (loading && trips.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error && trips.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setCreateModalVisible(true)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Create new trip"
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <CreateTripModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSave={handleCreateSave}
      />

      <EditTripModal
        visible={editModalVisible}
        trip={editingTrip}
        onClose={handleEditClose}
        onSave={handleEditSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  listContent: {
    paddingTop: Spacing.md,
    paddingBottom: 100,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.h1.fontSize,
    fontWeight: Typography.h1.fontWeight,
    color: Colors.text,
  },
  tripCount: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    color: Colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: Spacing.xl,
  },
  errorText: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  retryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
  },
  retryText: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
});
