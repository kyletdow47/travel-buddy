import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/constants/theme';
import { FlightCard } from '../../src/components/FlightCard';
import { haptics } from '../../src/lib/haptics';

type FlightInfo = {
  id: string;
  airline: string;
  flightNumber: string;
  departure: { code: string; city: string; time: string };
  arrival: { code: string; city: string; time: string };
  status: string;
  duration: string;
};

const SAMPLE_FLIGHTS: FlightInfo[] = [
  {
    id: '1',
    airline: 'Delta Air Lines',
    flightNumber: 'DL 2345',
    departure: { code: 'JFK', city: 'New York', time: '6:45 AM' },
    arrival: { code: 'LAX', city: 'Los Angeles', time: '10:12 AM' },
    status: 'On Time',
    duration: '5h 27m',
  },
  {
    id: '2',
    airline: 'United Airlines',
    flightNumber: 'UA 890',
    departure: { code: 'LAX', city: 'Los Angeles', time: '2:30 PM' },
    arrival: { code: 'NRT', city: 'Tokyo', time: '5:45 PM +1' },
    status: 'Delayed',
    duration: '11h 15m',
  },
  {
    id: '3',
    airline: 'British Airways',
    flightNumber: 'BA 178',
    departure: { code: 'NRT', city: 'Tokyo', time: '10:00 AM' },
    arrival: { code: 'LHR', city: 'London', time: '3:30 PM' },
    status: 'On Time',
    duration: '12h 30m',
  },
];

export default function FlightsScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const [flights] = useState<FlightInfo[]>(SAMPLE_FLIGHTS);

  const handleAddFlight = useCallback(() => {
    haptics.light();
    Alert.alert(
      'Add Flight',
      'Flight search and tracking coming soon! You will be able to search by flight number or route.',
      [{ text: 'OK' }],
    );
  }, []);

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: 'Flights',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerTitleStyle: Typography.h3,
        }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {flights.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="airplane-outline" size={40} color={Colors.category.flight} />
            </View>
            <Text style={styles.emptyTitle}>No flights yet</Text>
            <Text style={styles.emptyText}>
              Add your first flight to start tracking departures and arrivals.
            </Text>
          </View>
        ) : (
          flights.map((flight) => (
            <View key={flight.id} style={styles.cardWrapper}>
              <FlightCard flight={flight} />
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Flight FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={handleAddFlight}
      >
        <Ionicons name="add" size={24} color={Colors.surface} />
        <Text style={styles.fabText}>Add Flight</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 100,
  },
  cardWrapper: {
    marginBottom: Spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl * 2,
    gap: Spacing.sm,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${Colors.category.flight}18`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.category.flight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    ...Shadows.md,
  },
  fabText: {
    ...Typography.bodyMed,
    color: Colors.surface,
    fontWeight: '700',
  },
});
