import { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { haptics } from '../lib/haptics';

type Props = {
  pendingCount: number;
  syncing: boolean;
  onSync: () => void;
  lastError?: string | null;
};

export const SyncStatusBanner = memo(function SyncStatusBanner({
  pendingCount,
  syncing,
  onSync,
  lastError,
}: Props) {
  if (pendingCount === 0 && !lastError) return null;

  return (
    <View style={[styles.banner, lastError ? styles.bannerError : styles.bannerPending]}>
      <View style={styles.left}>
        {syncing ? (
          <ActivityIndicator size="small" color={"#FFFFFF"} />
        ) : (
          <Ionicons
            name={lastError ? 'warning-outline' : 'cloud-upload-outline'}
            size={18}
            color={"#FFFFFF"}
          />
        )}
        <Text style={styles.text} numberOfLines={1}>
          {syncing
            ? 'Syncing changes...'
            : lastError
              ? 'Sync failed — tap to retry'
              : `${pendingCount} change${pendingCount !== 1 ? 's' : ''} pending`}
        </Text>
      </View>
      {!syncing && (
        <TouchableOpacity
          style={styles.syncBtn}
          activeOpacity={0.8}
          onPress={() => {
            haptics.light();
            onSync();
          }}
        >
          <Ionicons name="sync" size={16} color={"#FFFFFF"} />
          <Text style={styles.syncText}>Sync</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: Radius.lg,
  },
  bannerPending: {
    backgroundColor: Colors.primary,
  },
  bannerError: {
    backgroundColor: '#EF4444',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  text: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  syncText: {
    ...Typography.micro,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
