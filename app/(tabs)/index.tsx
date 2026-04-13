import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { format } from 'date-fns';
import { useTrips } from '../../src/hooks/useTrips';
import { deleteTrip } from '../../src/services/tripsService';
import TripCard from '../../src/components/TripCard';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import type { Trip } from '../../src/types';

export default function HomeScreen() {
  const { trips, loading, error, refetch } = useTrips();

  const handlePressTrip = useCallback((_trip: Trip) => {
    // Trip detail navigation will be wired in a later task
  }, []);

  const handleEditTrip = useCallback((_trip: Trip) => {
    // EditTripModal will be wired in a later task
  }, []);

  const handleDeleteTrip = useCallback(
    (trip: Trip) => {
      Alert.alert(
        'Delete Trip',
        `Are you sure you want to delete "${trip.name}"? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteTrip(trip.id);
                refetch();
              } catch {
                Alert.alert('Error', 'Failed to delete trip.');
              }
            },
          },
        ],
      );
    },
    [refetch],
  );

  const renderItem = useCallback(
    ({ item }: { item: Trip }) => (
      <TripCard
        trip={item}
        onPress={() => handlePressTrip(item)}
        onEdit={() => handleEditTrip(item)}
        onDelete={() => handleDeleteTrip(item)}
      />
    ),
    [handlePressTrip, handleEditTrip, handleDeleteTrip],
  );

  const keyExtractor = useCallback((item: Trip) => item.id, []);

  const listHeader = (
    <View style={styles.header}>
      <Text style={styles.title}>My Trips</Text>
      <Text style={styles.subtitle}>{format(new Date(), 'EEEE, MMMM d')}</Text>
      {/* ActiveTripBanner will be rendered here once the component is built */}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first trip to get started!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.h1.fontSize,
    fontWeight: Typography.h1.fontWeight,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  errorText: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: Colors.error,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: Colors.textSecondary,
  },
});
