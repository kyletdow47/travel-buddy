import { useCallback, useEffect, useState } from 'react';
import {
  getEntries,
  createEntry,
  updateEntry,
  deleteEntry,
} from '../services/journalService';
import type { JournalEntry, JournalEntryInsert } from '../types';

type State = {
  entries: JournalEntry[];
  loading: boolean;
  error: string | null;
};

export function useJournal(tripId: string | null) {
  const [state, setState] = useState<State>({
    entries: [],
    loading: false,
    error: null,
  });

  const load = useCallback(async () => {
    if (!tripId) {
      setState({ entries: [], loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const entries = await getEntries(tripId);
      setState({ entries, loading: false, error: null });
    } catch (err) {
      setState({ entries: [], loading: false, error: String(err) });
    }
  }, [tripId]);

  useEffect(() => {
    load();
  }, [load]);

  const addEntry = useCallback(
    async (insert: JournalEntryInsert) => {
      const entry = await createEntry(insert);
      setState((s) => ({ ...s, entries: [entry, ...s.entries] }));
      return entry;
    },
    [],
  );

  const editEntry = useCallback(
    async (id: string, updates: Partial<JournalEntryInsert>) => {
      const entry = await updateEntry(id, updates);
      setState((s) => ({
        ...s,
        entries: s.entries.map((x) => (x.id === id ? entry : x)),
      }));
      return entry;
    },
    [],
  );

  const removeEntry = useCallback(async (id: string) => {
    await deleteEntry(id);
    setState((s) => ({
      ...s,
      entries: s.entries.filter((x) => x.id !== id),
    }));
  }, []);

  return { ...state, refresh: load, addEntry, editEntry, removeEntry };
}
