import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FrostedSheet } from './FrostedSheet';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import type { Trip } from '../types';
import {
  archiveTrip,
  unarchiveTrip,
  duplicateTrip,
  deleteTrip,
} from '../lib/tripActions';

type Props = {
  trip: Trip | null;
  visible: boolean;
  onClose: () => void;
  /** Called after any mutation succeeds so callers can refresh. */
  onChanged?: (next: { kind: 'archive' | 'unarchive' | 'duplicate' | 'delete'; trip?: Trip }) => void;
};

type Busy = null | 'archive' | 'duplicate' | 'delete';

export function TripActionSheet({ trip, visible, onClose, onChanged }: Props) {
  const [busy, setBusy] = useState<Busy>(null);

  if (!trip) return null;

  const archived = Boolean(
    (trip as Trip & { archived_at?: string | null }).archived_at,
  );

  const confirm = (title: string, message: string) =>
    new Promise<boolean>((resolve) => {
      Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: () => resolve(true),
        },
      ]);
    });

  const handleArchive = async () => {
    try {
      setBusy('archive');
      const next = archived ? await unarchiveTrip(trip.id) : await archiveTrip(trip.id);
      onChanged?.({ kind: archived ? 'unarchive' : 'archive', trip: next });
      onClose();
    } catch (e) {
      Alert.alert('Could not update trip', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setBusy(null);
    }
  };

  const handleDuplicate = async () => {
    try {
      setBusy('duplicate');
      const next = await duplicateTrip(trip.id);
      onChanged?.({ kind: 'duplicate', trip: next });
      onClose();
    } catch (e) {
      Alert.alert('Could not duplicate', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm(
      'Delete this trip?',
      'This permanently removes the trip and all its stops, receipts, and notes. This can\'t be undone.',
    );
    if (!ok) return;
    try {
      setBusy('delete');
      await deleteTrip(trip.id);
      onChanged?.({ kind: 'delete' });
      onClose();
    } catch (e) {
      Alert.alert('Could not delete', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <FrostedSheet
      visible={visible}
      onClose={onClose}
      tint="dark"
      maxHeightRatio={0.5}
      accessibilityLabel="Trip actions"
    >
      <Text style={styles.title}>{trip.name}</Text>
      <Text style={styles.subtitle}>Trip actions</Text>

      <View style={styles.actions}>
        <ActionRow
          icon={archived ? 'archive-outline' : 'archive'}
          label={archived ? 'Unarchive trip' : 'Archive trip'}
          onPress={handleArchive}
          busy={busy === 'archive'}
        />
        <ActionRow
          icon="copy-outline"
          label="Duplicate trip"
          onPress={handleDuplicate}
          busy={busy === 'duplicate'}
        />
        <ActionRow
          icon="trash-outline"
          label="Delete trip"
          tone="danger"
          onPress={handleDelete}
          busy={busy === 'delete'}
        />
      </View>

      <Pressable
        onPress={onClose}
        style={({ pressed }) => [
          styles.cancel,
          pressed ? { opacity: 0.8 } : null,
        ]}
        accessibilityRole="button"
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </FrostedSheet>
  );
}

function ActionRow({
  icon,
  label,
  tone = 'default',
  onPress,
  busy,
}: {
  icon: keyof typeof import('@expo/vector-icons/build/Ionicons').glyphMap;
  label: string;
  tone?: 'default' | 'danger';
  onPress: () => void;
  busy: boolean;
}) {
  const color = tone === 'danger' ? Colors.error : Colors.textOnDark;
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      style={({ pressed }) => [
        styles.actionRow,
        pressed ? { backgroundColor: 'rgba(255,255,255,0.08)' } : null,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
      {busy ? <ActivityIndicator color={color} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    ...Typography.h2,
    color: Colors.textOnDark,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textOnDarkSecondary,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  actions: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  actionLabel: {
    ...Typography.bodyMed,
    fontWeight: '600',
    flex: 1,
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cancelText: {
    ...Typography.bodyMed,
    color: Colors.textOnDark,
    fontWeight: '600',
  },
});
