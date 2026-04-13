import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme';
import { useReceipts } from '../../src/hooks/useReceipts';
import ReceiptRow from '../../src/components/ReceiptRow';
import AddReceiptModal from '../../src/components/AddReceiptModal';
import { getTrips } from '../../src/services/tripsService';
import { deleteReceipt, syncTripSpent } from '../../src/services/receiptsService';
import type { Trip, Receipt } from '../../src/types';

const CATEGORIES = ['All', 'Food', 'Hotel', 'Gas', 'Activity', 'Other'];

export default function ReceiptsScreen() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const { receipts, loading, total, refetch } = useReceipts(selectedTripId);

  useEffect(() => {
    getTrips()
      .then((data) => {
        setTrips(data);
        if (data.length > 0) setSelectedTripId(data[0].id);
      })
      .catch(console.error);
  }, []);

  const selectedTrip = trips.find((t) => t.id === selectedTripId) ?? null;
  const budget = selectedTrip?.budget ?? 0;
  const progress = budget > 0 ? Math.min(total / budget, 1) : 0;

  const filtered =
    selectedCategory === 'All'
      ? receipts
      : receipts.filter(
          (r) => (r.category ?? 'other').toLowerCase() === selectedCategory.toLowerCase(),
        );

  async function handleDelete(receipt: Receipt) {
    Alert.alert('Delete Receipt', `Delete receipt from "${receipt.merchant ?? 'Unknown'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReceipt(receipt.id);
            if (selectedTripId) await syncTripSpent(selectedTripId);
            refetch();
          } catch {
            Alert.alert('Error', 'Failed to delete receipt.');
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Trip selector chips */}
      {trips.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {trips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={[styles.chip, selectedTripId === trip.id && styles.chipActive]}
              onPress={() => setSelectedTripId(trip.id)}
            >
              <Text style={[styles.chipText, selectedTripId === trip.id && styles.chipTextActive]}>
                {trip.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Total spend banner */}
      {selectedTrip && (
        <View style={styles.banner}>
          <View style={styles.bannerRow}>
            <Text style={styles.bannerLabel}>Total Spent</Text>
            <Text style={styles.bannerAmount}>${total.toFixed(2)}</Text>
          </View>
          {budget > 0 && (
            <>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.round(progress * 100)}%`,
                      backgroundColor: progress > 0.8 ? Colors.warning : Colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={styles.bannerBudget}>
                Budget: ${budget.toFixed(2)} · {Math.round(progress * 100)}% used
              </Text>
            </>
          )}
        </View>
      )}

      {/* Category filter bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, selectedCategory === cat && styles.chipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Receipt list */}
      {loading ? (
        <ActivityIndicator style={styles.loader} color={Colors.primary} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReceiptRow
              receipt={item}
              onPress={() => router.push(`/receipt/${item.id}` as const)}
              onDelete={() => handleDelete(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>No receipts yet — tap + to add one</Text>
            </View>
          }
          contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : undefined}
        />
      )}

      {/* FAB */}
      {selectedTripId && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}

      {/* AddReceiptModal */}
      {selectedTripId && (
        <AddReceiptModal
          visible={showAddModal}
          tripId={selectedTripId}
          onClose={() => setShowAddModal(false)}
          onSaved={() => {
            setShowAddModal(false);
            refetch();
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  banner: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
    padding: Spacing.md,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: Radius.md,
    gap: Spacing.xs,
  },
  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerLabel: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: Colors.textSecondary,
  },
  bannerAmount: {
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
    color: Colors.primary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  bannerBudget: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    color: Colors.textSecondary,
  },
  loader: {
    marginTop: Spacing.xl,
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xl * 2,
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyText: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
