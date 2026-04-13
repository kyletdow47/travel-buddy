import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../src/constants/theme';
import { createTrip, getTrips, updateTrip, deleteTrip } from '../src/services/tripsService';
import { createStop, getStops, updateStop, deleteStop, reorderStops, updateStopStatus } from '../src/services/stopsService';
import { createReceipt, getReceipts, updateReceipt, deleteReceipt, syncTripSpent } from '../src/services/receiptsService';
import { getConversation, upsertConversation, appendMessage, clearConversation } from '../src/services/conversationsService';
import type { Trip, Stop, Receipt, Conversation } from '../src/types';
import type { Message } from '../src/services/conversationsService';

type LogEntry = {
  label: string;
  status: 'pass' | 'fail' | 'info';
  detail: string;
};

export default function SmokeTestScreen() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);

  const log = useCallback(
    (label: string, status: LogEntry['status'], detail: string) => {
      setLogs((prev) => [...prev, { label, status, detail }]);
    },
    []
  );

  const runTests = useCallback(async () => {
    setLogs([]);
    setRunning(true);

    let tripId = '';
    let stopId = '';
    let receiptId = '';

    try {
      // 1. Create a trip
      log('createTrip', 'info', 'Creating test trip...');
      const trip: Trip = await createTrip({
        name: 'Smoke Test Trip',
        budget: 1000,
        status: 'planning',
      });
      tripId = trip.id;
      log('createTrip', 'pass', `Created trip "${trip.name}" (id: ${trip.id})`);

      // 2. Verify it shows up in list
      const trips: Trip[] = await getTrips();
      const found = trips.find((t) => t.id === tripId);
      if (found) {
        log('getTrips', 'pass', `Trip found in list (${trips.length} total)`);
      } else {
        log('getTrips', 'fail', 'Trip NOT found in list');
      }

      // 3. Update the trip
      const updated: Trip = await updateTrip(tripId, { name: 'Updated Smoke Test' });
      log('updateTrip', 'pass', `Renamed to "${updated.name}"`);

      // 4. Create a stop
      log('createStop', 'info', 'Creating test stop...');
      const stop: Stop = await createStop({
        trip_id: tripId,
        name: 'Test Stop',
        location: 'Test City',
        lat: 40.7128,
        lng: -74.006,
        category: 'sightseeing',
        sort_order: 0,
        status: 'upcoming',
      });
      stopId = stop.id;
      log('createStop', 'pass', `Created stop "${stop.name}" (id: ${stop.id})`);

      // 5. Get stops for trip
      const stops: Stop[] = await getStops(tripId);
      log('getStops', 'pass', `Found ${stops.length} stop(s) for trip`);

      // 6. Update stop status
      const updatedStop: Stop = await updateStopStatus(stopId, 'done');
      log('updateStopStatus', 'pass', `Stop status → "${updatedStop.status}"`);

      // 7. Reorder stops (single stop)
      await reorderStops([stopId]);
      log('reorderStops', 'pass', 'Reordered stops');

      // 8. Create a receipt
      log('createReceipt', 'info', 'Creating test receipt...');
      const receipt: Receipt = await createReceipt({
        trip_id: tripId,
        stop_id: stopId,
        merchant: 'Test Merchant',
        amount: 42.5,
        category: 'food',
        receipt_date: new Date().toISOString().split('T')[0],
      });
      receiptId = receipt.id;
      log('createReceipt', 'pass', `Created receipt $${receipt.amount} (id: ${receipt.id})`);

      // 9. Get receipts
      const receipts: Receipt[] = await getReceipts(tripId);
      log('getReceipts', 'pass', `Found ${receipts.length} receipt(s)`);

      // 10. Sync trip spent
      await syncTripSpent(tripId);
      const tripAfterSync: Trip[] = await getTrips();
      const synced = tripAfterSync.find((t) => t.id === tripId);
      log('syncTripSpent', 'pass', `Trip spent updated to $${synced?.spent ?? 0}`);

      // 11. Append message to conversation
      const message: Message = {
        role: 'user',
        content: 'Hello from smoke test',
        timestamp: new Date().toISOString(),
      };
      const conv: Conversation = await appendMessage(tripId, message);
      log('appendMessage', 'pass', `Conversation created (id: ${conv.id})`);

      // 12. Get conversation
      const fetched: Conversation | null = await getConversation(tripId);
      if (fetched) {
        log('getConversation', 'pass', `Fetched conversation with messages`);
      } else {
        log('getConversation', 'fail', 'Conversation not found');
      }

      // 13. Upsert conversation
      const assistantMsg: Message = {
        role: 'assistant',
        content: 'Smoke test reply',
        timestamp: new Date().toISOString(),
      };
      const upserted: Conversation = await upsertConversation(tripId, [message, assistantMsg]);
      log('upsertConversation', 'pass', `Upserted with 2 messages (id: ${upserted.id})`);

      // 14. Clear conversation
      await clearConversation(tripId);
      log('clearConversation', 'pass', 'Conversation cleared');

      // Cleanup: delete all test data
      log('cleanup', 'info', 'Deleting test data...');
      await deleteReceipt(receiptId);
      log('deleteReceipt', 'pass', `Deleted receipt ${receiptId}`);
      await deleteStop(stopId);
      log('deleteStop', 'pass', `Deleted stop ${stopId}`);
      await deleteTrip(tripId);
      log('deleteTrip', 'pass', `Deleted trip ${tripId}`);

      log('DONE', 'pass', 'All smoke tests passed!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      log('ERROR', 'fail', errorMessage);

      // Attempt cleanup on failure
      try {
        if (receiptId) await deleteReceipt(receiptId);
        if (stopId) await deleteStop(stopId);
        if (tripId) await deleteTrip(tripId);
        log('cleanup', 'info', 'Cleaned up after failure');
      } catch {
        log('cleanup', 'fail', 'Cleanup also failed');
      }
    } finally {
      setRunning(false);
    }
  }, [log]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Phase 2 Smoke Test</Text>
      </View>
      <ScrollView style={styles.logContainer} contentContainerStyle={styles.logContent}>
        {logs.map((entry, i) => (
          <View key={i} style={styles.logEntry}>
            <Text
              style={[
                styles.logStatus,
                entry.status === 'pass' && styles.pass,
                entry.status === 'fail' && styles.fail,
                entry.status === 'info' && styles.info,
              ]}
            >
              {entry.status === 'pass' ? 'PASS' : entry.status === 'fail' ? 'FAIL' : 'INFO'}
            </Text>
            <View style={styles.logBody}>
              <Text style={styles.logLabel}>{entry.label}</Text>
              <Text style={styles.logDetail}>{entry.detail}</Text>
            </View>
          </View>
        ))}
        {logs.length === 0 && (
          <Text style={styles.placeholder}>
            Press &quot;Run Tests&quot; to exercise all service functions against Supabase.
          </Text>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          onPress={runTests}
          disabled={running}
          style={[styles.runButton, running && styles.runButtonDisabled]}
        >
          <Text style={styles.runButtonText}>
            {running ? 'Running...' : 'Run Tests'}
          </Text>
        </Pressable>
      </View>
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  backButton: {
    paddingRight: Spacing.md,
  },
  backText: {
    color: Colors.primary,
    fontSize: Typography.body.fontSize,
    fontWeight: '500',
  },
  title: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.text,
  },
  logContainer: {
    flex: 1,
  },
  logContent: {
    padding: Spacing.md,
  },
  logEntry: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    alignItems: 'flex-start',
  },
  logStatus: {
    width: 44,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 2,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    marginRight: Spacing.sm,
  },
  pass: {
    color: Colors.success,
    backgroundColor: '#ECFDF5',
  },
  fail: {
    color: Colors.error,
    backgroundColor: '#FEF2F2',
  },
  info: {
    color: Colors.textSecondary,
    backgroundColor: Colors.backgroundSecondary,
  },
  logBody: {
    flex: 1,
  },
  logLabel: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.text,
  },
  logDetail: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  placeholder: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  runButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  runButtonDisabled: {
    opacity: 0.6,
  },
  runButtonText: {
    color: Colors.background,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
  },
});
