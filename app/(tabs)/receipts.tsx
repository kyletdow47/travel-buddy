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
import { useReceipts } from '../../src/hooks/useReceipts';
import { useDarkColors } from '../../src/hooks/useDarkColors';
import { ReceiptRow } from '../../src/components/ReceiptRow';
import { SkeletonReceiptRow } from '../../src/components/SkeletonLoader';
import { EmptyState } from '../../src/components/EmptyState';
import { deleteReceipt } from '../../src/services/receiptsService';
import { Colors, Spacing, Typography, Radius } from '../../src/constants/theme';
import type { Receipt } from '../../src/types';

export default function ReceiptsScreen() {
  const colors = useDarkColors();
  const { trips, loading: tripsLoading } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const activeTripId = selectedTripId ?? trips[0]?.id ?? null;
  const { receipts, loading: receiptsLoading, refetch: refetchReceipts } = useReceipts(activeTripId);

  const totalSpent = receipts.reduce((sum, r) => sum + r.amount, 0);

  async function handleDeleteReceipt(receipt: Receipt) {
    Alert.alert('Delete Receipt', 'Delete this receipt?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deleteReceipt(receipt.id);
            await refetchReceipts();
            Toast.show({ type: 'success', text1: 'Receipt deleted' });
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to delete receipt' });
          }
        },
      },
    ]);
  }

  function handleSelectTrip(tripId: string) {
    Haptics.selectionAsync();
    setSelectedTripId(tripId);
  }

  const isLoading = tripsLoading || receiptsLoading;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Receipts</Text>
        {receipts.length > 0 && (
          <Text style={[styles.totalText, { color: colors.textSecondary }]}>
            Total: ${totalSpent.toFixed(2)}
          </Text>
        )}
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
          {[1, 2, 3, 4, 5].map((i) => <SkeletonReceiptRow key={i} />)}
        </View>
      ) : (
        <FlatList
          data={receipts}
          keyExtractor={(item) => item.id}
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={receiptsLoading}
              onRefresh={refetchReceipts}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={receipts.length === 0 ? styles.emptyContainer : styles.listContent}
          ListEmptyComponent={
            trips.length === 0 ? (
              <EmptyState
                icon="airplane"
                title="No trips yet"
                subtitle="Create a trip from the Home tab first"
              />
            ) : (
              <EmptyState
                icon="receipt"
                title="No receipts"
                subtitle="Tap + to log your first expense"
              />
            )
          }
          renderItem={({ item }) => (
            <ReceiptRow
              receipt={item}
              colors={colors}
              onDelete={() => handleDeleteReceipt(item)}
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
  totalText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '500',
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
