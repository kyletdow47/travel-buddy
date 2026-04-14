import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../../src/lib/supabase';
import type { Trip, Reservation } from '../../src/types';
import { useReservations } from '../../src/hooks/useReservations';
import {
  ReservationRow,
  ReservationSeparator,
} from '../../src/components/ReservationRow';
import { AddReservationModal } from '../../src/components/AddReservationModal';
import { ReservationDetailSheet } from '../../src/components/ReservationDetailSheet';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/constants/theme';
import { haptics } from '../../src/lib/haptics';

export default function ReservationsScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [tripLoading, setTripLoading] = useState(true);

  const {
    reservations,
    loading: reservationsLoading,
    refresh: refreshReservations,
    addReservation,
    editReservation,
    removeReservation,
  } = useReservations(tripId ?? null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Load trip name
  useEffect(() => {
    if (!tripId) return;
    setTripLoading(true);
    supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single()
      .then(({ data }) => {
        setTrip(data as Trip | null);
        setTripLoading(false);
      });
  }, [tripId]);

  const onRefresh = useCallback(async () => {
    await refreshReservations();
  }, [refreshReservations]);

  const handleDelete = useCallback(
    (reservation: Reservation) => {
      Alert.alert('Delete reservation', `Remove "${reservation.provider}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            haptics.warning();
            setSelectedReservation(null);
            await removeReservation(reservation.id);
          },
        },
      ]);
    },
    [removeReservation],
  );

  const loading = tripLoading || reservationsLoading;

  if (tripLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          {trip ? (
            <Text style={styles.headerEyebrow} numberOfLines={1}>
              {trip.name}
            </Text>
          ) : null}
          <Text style={styles.headerTitle}>Reservations</Text>
        </View>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={reservations}
        keyExtractor={(r) => String(r.id)}
        renderItem={({ item }) => (
          <ReservationRow
            reservation={item}
            onPress={() => {
              haptics.selection();
              setSelectedReservation(item);
            }}
          />
        )}
        ItemSeparatorComponent={ReservationSeparator}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="document-text-outline" size={40} color={Colors.textTertiary} />
              </View>
              <Text style={styles.emptyTitle}>No reservations yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your flights, hotels, and car rentals to keep everything organized.
              </Text>
              <TouchableOpacity
                style={styles.ctaButton}
                activeOpacity={0.85}
                onPress={() => setAddModalOpen(true)}
              >
                <Ionicons name="add" size={18} color={Colors.surface} />
                <Text style={styles.ctaButtonText}>Add First Reservation</Text>
              </TouchableOpacity>
            </View>
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

      {/* Add Reservation Modal */}
      {tripId ? (
        <AddReservationModal
          visible={addModalOpen}
          tripId={tripId}
          onClose={() => setAddModalOpen(false)}
          onAdd={addReservation}
        />
      ) : null}

      {/* Reservation Detail Sheet */}
      <ReservationDetailSheet
        reservation={selectedReservation}
        visible={selectedReservation !== null}
        onClose={() => setSelectedReservation(null)}
        onEdit={() => {
          // TODO: wire up edit modal when EditReservationModal is built
          setSelectedReservation(null);
        }}
        onDelete={
          selectedReservation ? () => handleDelete(selectedReservation) : undefined
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerEyebrow: {
    ...Typography.micro,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  listContent: {
    paddingBottom: 100,
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
