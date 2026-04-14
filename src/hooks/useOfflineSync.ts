import { useCallback, useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import {
  getMutationQueue,
  replayMutationQueue,
  clearMutationQueue,
  type QueuedMutation,
} from '../lib/offlineCache';

/**
 * Hook that manages offline mutation queue state and replay.
 * Automatically replays queued mutations when the app returns to foreground.
 */
export function useOfflineSync() {
  const [queue, setQueue] = useState<QueuedMutation[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<{
    succeeded: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const loadQueue = useCallback(async () => {
    const q = await getMutationQueue();
    setQueue(q);
  }, []);

  const sync = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const result = await replayMutationQueue();
      setLastSyncResult(result);
      await loadQueue();
    } finally {
      setSyncing(false);
    }
  }, [syncing, loadQueue]);

  const clearQueue = useCallback(async () => {
    await clearMutationQueue();
    setQueue([]);
    setLastSyncResult(null);
  }, []);

  // Load queue on mount
  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  // Auto-sync when app comes to foreground
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        loadQueue().then(() => {
          // Only auto-sync if there are queued mutations
          getMutationQueue().then((q) => {
            if (q.length > 0) sync();
          });
        });
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [loadQueue, sync]);

  return {
    queue,
    pendingCount: queue.length,
    syncing,
    lastSyncResult,
    sync,
    clearQueue,
    refresh: loadQueue,
  };
}
