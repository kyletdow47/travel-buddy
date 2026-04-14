import { supabase } from '../lib/supabase';
import type { PackingItem, PackingItemInsert, PackingItemUpdate } from '../types';

export async function getPackingItems(tripId: string): Promise<PackingItem[]> {
  const { data, error } = await supabase
    .from('packing_items')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createPackingItem(
  item: PackingItemInsert,
): Promise<PackingItem> {
  const { data, error } = await supabase
    .from('packing_items')
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePackingItem(
  id: string,
  updates: PackingItemUpdate,
): Promise<PackingItem> {
  const { data, error } = await supabase
    .from('packing_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePackingItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('packing_items')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function togglePacked(
  id: string,
  packed: boolean,
): Promise<PackingItem> {
  const { data, error } = await supabase
    .from('packing_items')
    .update({ packed })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
