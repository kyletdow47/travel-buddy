import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme';
import { BookingLinkRow } from '../../src/components/BookingLinkRow';

type Service = {
  name: string;
  icon: string;
  type: string;
};

const FLIGHT_SERVICES: Service[] = [
  { name: 'Skyscanner', icon: 'airplane', type: 'flights' },
  { name: 'Kiwi.com', icon: 'airplane', type: 'flights' },
];

const HOTEL_SERVICES: Service[] = [
  { name: 'Booking.com', icon: 'bed', type: 'hotels' },
  { name: 'Airbnb', icon: 'bed', type: 'hotels' },
  { name: 'Hostelworld', icon: 'bed', type: 'hotels' },
];

const ACTIVITY_SERVICES: Service[] = [
  { name: 'Viator', icon: 'ticket', type: 'activities' },
  { name: 'GetYourGuide', icon: 'ticket', type: 'activities' },
];

export default function BookingsScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: 'Book & Save',
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
        {/* Flights section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="airplane" size={16} color={Colors.category.flight} />
            <Text style={styles.sectionTitle}>Flights</Text>
          </View>
          <View style={styles.sectionList}>
            {FLIGHT_SERVICES.map((service) => (
              <View key={service.name} style={styles.rowWrapper}>
                <BookingLinkRow service={service} />
              </View>
            ))}
          </View>
        </View>

        {/* Hotels section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bed" size={16} color={Colors.category.lodging} />
            <Text style={styles.sectionTitle}>Hotels</Text>
          </View>
          <View style={styles.sectionList}>
            {HOTEL_SERVICES.map((service) => (
              <View key={service.name} style={styles.rowWrapper}>
                <BookingLinkRow service={service} />
              </View>
            ))}
          </View>
        </View>

        {/* Activities section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="ticket" size={16} color={Colors.category.activity} />
            <Text style={styles.sectionTitle}>Activities</Text>
          </View>
          <View style={styles.sectionList}>
            {ACTIVITY_SERVICES.map((service) => (
              <View key={service.name} style={styles.rowWrapper}>
                <BookingLinkRow service={service} />
              </View>
            ))}
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.disclaimerText}>
            We earn a small commission when you book through these links. This helps keep Travel Buddy free!
          </Text>
        </View>
      </ScrollView>
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
    paddingBottom: Spacing.xxxl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.eyebrow,
    color: Colors.textSecondary,
  },
  sectionList: {
    gap: Spacing.sm,
  },
  rowWrapper: {},
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceDim,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  disclaimerText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    flex: 1,
    lineHeight: 18,
  },
});
