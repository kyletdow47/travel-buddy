import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'tb_cache_';
const MUTATION_QUEUE_KEY = 'tb_mutation_queue';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ── Cache Layer ─────────────────────────────────────────────────────────

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export async function setCache<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    // Silently fail — cache is best-effort
  }
}

export async function clearCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch {
    // no-op
  }
}

export async function clearAllCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch {
    // no-op
  }
}

// ── Mutation Queue ──────────────────────────────────────────────────────

export type QueuedMutation = {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  payload: Record<string, unknown>;
  createdAt: number;
};

export async function getMutationQueue(): Promise<QueuedMutation[]> {
  try {
    const raw = await AsyncStorage.getItem(MUTATION_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function enqueueMutation(mutation: Omit<QueuedMutation, 'id' | 'createdAt'>): Promise<void> {
  const queue = await getMutationQueue();
  queue.push({
    ...mutation,
    id: `mut_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  });
  await AsyncStorage.setItem(MUTATION_QUEUE_KEY, JSON.stringify(queue));
}

export async function dequeueMutation(id: string): Promise<void> {
  const queue = await getMutationQueue();
  const filtered = queue.filter((m) => m.id !== id);
  await AsyncStorage.setItem(MUTATION_QUEUE_KEY, JSON.stringify(filtered));
}

export async function clearMutationQueue(): Promise<void> {
  await AsyncStorage.removeItem(MUTATION_QUEUE_KEY);
}

// ── Sync Engine ─────────────────────────────────────────────────────────

import { supabase } from './supabase';

export async function replayMutationQueue(): Promise<{
  succeeded: number;
  failed: number;
  errors: string[];
}> {
  const queue = await getMutationQueue();
  let succeeded = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const mutation of queue) {
    try {
      const { table, operation, payload } = mutation;
      let result;

      // Use `as any` for dynamic table — offline queue replays arbitrary tables
      const tbl = supabase.from(table as any);
      switch (operation) {
        case 'insert':
          result = await (tbl as any).insert(payload).select().single();
          break;
        case 'update': {
          const { id: recordId, ...updates } = payload;
          result = await (tbl as any).update(updates).eq('id', recordId as string).select().single();
          break;
        }
        case 'delete':
          result = await (tbl as any).delete().eq('id', payload.id as string);
          break;
      }

      if (result?.error) throw result.error;

      await dequeueMutation(mutation.id);
      succeeded++;
    } catch (err) {
      failed++;
      errors.push(`${mutation.table}.${mutation.operation}: ${String(err)}`);
    }
  }

  return { succeeded, failed, errors };
}
