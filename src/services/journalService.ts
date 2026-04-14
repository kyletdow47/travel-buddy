import { supabase } from '../lib/supabase';
import type { JournalEntry, JournalEntryInsert } from '../types';

export async function getEntries(tripId: string): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as unknown as JournalEntry[];
}

export async function createEntry(
  entry: JournalEntryInsert
): Promise<JournalEntry> {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as JournalEntry;
}

export async function updateEntry(
  id: string,
  updates: Partial<JournalEntryInsert>
): Promise<JournalEntry> {
  const { data, error } = await supabase
    .from('journal_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as JournalEntry;
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
