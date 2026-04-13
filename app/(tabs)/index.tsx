import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useTrips } from '../../src/hooks/useTrips';
import { useDarkColors } from '../../src/hooks/useDarkColors';
import { TripCard } from '../../src/components/TripCard';
import { SkeletonTripCard } from '../../src/components/SkeletonLoader';
import { EmptyState } from '../../src/components/EmptyState';
import { deleteTrip } from '../../src/services/tripsService';
import { Spacing, Typography } from '../../src/constants/theme';
import type { Trip } from '../../src/types';

export default function HomeScreen() {
  const colors = useDarkColors();
  const { trips, loading, refetch } = useTrips();

  async function handleDelete(trip: Trip) {
    Alert.alert('Delete Trip', `Delete "${trip.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deleteTrip(trip.id);
            await refetch();
            Toast.show({ type: 'success', text1: 'Trip deleted' });
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to delete trip' });
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>My Trips</Text>
      </View>

      {loading ? (
        <View style={styles.skeletonList}>
          {[1, 2, 3].map((i) => <SkeletonTripCard key={i} />)}
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={trips.length === 0 ? styles.emptyContainer : styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="airplane"
              title="No trips yet"
              subtitle="Tap + to plan your first adventure"
              ctaLabel="Create Trip"
              onCta={() => Haptics.selectionAsync()}
            />
          }
          renderItem={({ item }) => (
            <TripCard
              trip={item}
              colors={colors}
              onPress={() => Haptics.selectionAsync()}
              onLongPress={() => handleDelete(item)}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
  },
  skeletonList: {
    paddingTop: Spacing.sm,
  },
  listContent: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  emptyContainer: {
    flex: 1,
  },
});
