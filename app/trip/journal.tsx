import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/constants/theme';
import { haptics } from '../../src/lib/haptics';
import { useJournal } from '../../src/hooks/useJournal';
import { JournalEntryCard } from '../../src/components/JournalEntryCard';
import { AddJournalEntryModal } from '../../src/components/AddJournalEntryModal';
import type { JournalEntry } from '../../src/types';

function groupByDate(entries: JournalEntry[]): { date: string; items: JournalEntry[] }[] {
  const groups = new Map<string, JournalEntry[]>();
  for (const entry of entries) {
    const dateKey = entry.created_at
      ? new Date(entry.created_at).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })
      : 'Unknown Date';
    const arr = groups.get(dateKey) ?? [];
    arr.push(entry);
    groups.set(dateKey, arr);
  }
  return Array.from(groups.entries()).map(([date, items]) => ({ date, items }));
}

export default function JournalScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { entries, loading, refresh, addEntry } = useJournal(tripId ?? null);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const grouped = useMemo(() => groupByDate(entries), [entries]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleFab = useCallback(() => {
    haptics.medium();
    setModalOpen(true);
  }, []);

  if (loading && entries.length === 0) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="book-outline" size={24} color={Colors.primary} />
        <Text style={styles.headerTitle}>Travel Journal</Text>
      </View>

      {entries.length === 0 ? (
        /* Empty state */
        <View style={styles.emptyState}>
          <Ionicons name="book-outline" size={64} color={Colors.textOnCardTertiary} />
          <Text style={styles.emptyTitle}>Start documenting your journey</Text>
          <Text style={styles.emptyText}>
            Capture your thoughts, moods, and memories from each day of your trip.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
        >
          {grouped.map(({ date, items }) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateLabel}>{date}</Text>
              {items.map((entry) => (
                <JournalEntryCard key={entry.id} entry={entry} />
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={handleFab}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add entry modal */}
      {tripId ? (
        <AddJournalEntryModal
          visible={modalOpen}
          tripId={tripId}
          onClose={() => setModalOpen(false)}
          onAdd={addEntry}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.text,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },

  // Date groups
  dateGroup: {
    marginBottom: Spacing.md,
  },
  dateLabel: {
    ...Typography.eyebrow,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xxl,
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.textOnCard,
    textAlign: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textOnCardSecondary,
    textAlign: 'center',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 100,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
});
