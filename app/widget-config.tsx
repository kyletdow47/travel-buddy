import { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTrips } from '../src/hooks/useTrips';
import { Colors, Typography, Spacing, Radius, Shadows } from '../src/constants/theme';
import { haptics } from '../src/lib/haptics';

const WIDGET_TYPES = [
  {
    id: 'next-activity',
    name: 'Next Activity',
    description: 'Shows your upcoming activity with countdown',
    sizes: ['Small', 'Medium'],
    icon: 'time-outline' as const,
  },
  {
    id: 'flight-status',
    name: 'Flight Status',
    description: 'Live flight tracking with gate & terminal',
    sizes: ['Small', 'Medium', 'Large'],
    icon: 'airplane-outline' as const,
  },
  {
    id: 'trip-countdown',
    name: 'Trip Countdown',
    description: 'Days until your next trip',
    sizes: ['Small'],
    icon: 'calendar-outline' as const,
  },
  {
    id: 'packing-progress',
    name: 'Packing Progress',
    description: 'See how packed you are at a glance',
    sizes: ['Small', 'Medium'],
    icon: 'cube-outline' as const,
  },
  {
    id: 'budget-tracker',
    name: 'Budget Tracker',
    description: 'Spending vs budget progress bar',
    sizes: ['Small', 'Medium'],
    icon: 'wallet-outline' as const,
  },
];

const WATCH_COMPLICATIONS = [
  {
    id: 'next-event',
    name: 'Next Event',
    description: 'Current trip\'s next activity on your wrist',
    icon: 'watch-outline' as const,
  },
  {
    id: 'countdown',
    name: 'Trip Countdown',
    description: 'Days remaining in current trip',
    icon: 'hourglass-outline' as const,
  },
];

export default function WidgetConfigScreen() {
  const router = useRouter();
  const { trips } = useTrips();

  const activeTrip = useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    return trips.find((t) => t.start_date && t.end_date && t.start_date <= now && t.end_date >= now)
      ?? trips[0]
      ?? null;
  }, [trips]);

  const handleWidgetTap = useCallback((widgetId: string) => {
    haptics.selection();
    Alert.alert(
      'Widget Setup',
      `To add this widget:\n\n1. Long-press your Home Screen\n2. Tap the + button\n3. Search "Travel Buddy"\n4. Choose "${widgetId}" widget\n\nThe widget will show data from your active trip${activeTrip ? ` (${activeTrip.name})` : ''}.`,
      [{ text: 'Got it' }],
    );
  }, [activeTrip]);

  const handleWatchTap = useCallback((compId: string) => {
    haptics.selection();
    Alert.alert(
      'Watch Complication',
      `To add this complication:\n\n1. Open the Watch app on your iPhone\n2. Tap your watch face\n3. Tap "Complications"\n4. Select Travel Buddy → ${compId}`,
      [{ text: 'Got it' }],
    );
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Widgets & Watch</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Active trip context */}
        {activeTrip && (
          <View style={styles.contextCard}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
            <Text style={styles.contextText}>
              Widgets will show data from <Text style={{ fontWeight: '700' }}>{activeTrip.name}</Text>
            </Text>
          </View>
        )}

        {/* Home Screen Widgets */}
        <Text style={styles.sectionTitle}>Home Screen Widgets</Text>
        <Text style={styles.sectionSubtitle}>
          Add Travel Buddy widgets to your Home Screen for quick trip info
        </Text>

        {WIDGET_TYPES.map((widget) => (
          <TouchableOpacity
            key={widget.id}
            style={styles.widgetCard}
            activeOpacity={0.85}
            onPress={() => handleWidgetTap(widget.name)}
          >
            <View style={styles.widgetIcon}>
              <Ionicons name={widget.icon} size={24} color={Colors.primary} />
            </View>
            <View style={styles.widgetInfo}>
              <Text style={styles.widgetName}>{widget.name}</Text>
              <Text style={styles.widgetDesc}>{widget.description}</Text>
              <View style={styles.sizeRow}>
                {widget.sizes.map((size) => (
                  <View key={size} style={styles.sizeBadge}>
                    <Text style={styles.sizeText}>{size}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textOnCardTertiary} />
          </TouchableOpacity>
        ))}

        {/* Lock Screen */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Lock Screen</Text>
        <Text style={styles.sectionSubtitle}>
          iOS 16+ lock screen widgets for at-a-glance info
        </Text>
        <View style={styles.lockScreenPreview}>
          <View style={styles.lockWidget}>
            <Ionicons name="airplane" size={14} color={"#FFFFFF"} />
            <Text style={styles.lockWidgetText}>SFO → NRT</Text>
          </View>
          <View style={styles.lockWidget}>
            <Ionicons name="time" size={14} color={"#FFFFFF"} />
            <Text style={styles.lockWidgetText}>3d 14h</Text>
          </View>
        </View>

        {/* Apple Watch */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Apple Watch</Text>
        <Text style={styles.sectionSubtitle}>
          Complications and a standalone watchOS app
        </Text>

        {WATCH_COMPLICATIONS.map((comp) => (
          <TouchableOpacity
            key={comp.id}
            style={styles.widgetCard}
            activeOpacity={0.85}
            onPress={() => handleWatchTap(comp.name)}
          >
            <View style={[styles.widgetIcon, { backgroundColor: Colors.surface }]}>
              <Ionicons name={comp.icon} size={24} color="#00FF88" />
            </View>
            <View style={styles.widgetInfo}>
              <Text style={styles.widgetName}>{comp.name}</Text>
              <Text style={styles.widgetDesc}>{comp.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textOnCardTertiary} />
          </TouchableOpacity>
        ))}

        {/* Siri */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Siri Shortcuts</Text>
        <View style={styles.siriCard}>
          <Ionicons name="mic-outline" size={32} color={Colors.primary} />
          <Text style={styles.siriText}>
            "Hey Siri, what's my next flight?" — App Intents coming soon
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  contextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contextText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  widgetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderOnCard,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  widgetIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetInfo: {
    flex: 1,
    gap: 2,
  },
  widgetName: {
    ...Typography.bodyMed,
    color: Colors.textOnCard,
    fontWeight: '700',
  },
  widgetDesc: {
    ...Typography.caption,
    color: Colors.textOnCardSecondary,
  },
  sizeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: 4,
  },
  sizeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: Colors.cardSecondary,
    borderRadius: Radius.full,
  },
  sizeText: {
    ...Typography.micro,
    color: Colors.textOnCardSecondary,
  },
  lockScreenPreview: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    marginBottom: Spacing.sm,
  },
  lockWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  lockWidgetText: {
    ...Typography.micro,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  siriCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.borderOnCard,
    borderStyle: 'dashed',
    gap: Spacing.sm,
  },
  siriText: {
    ...Typography.caption,
    color: Colors.textOnCardSecondary,
    textAlign: 'center',
  },
});
