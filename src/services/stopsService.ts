import { supabase } from '../lib/supabase';
import type { Stop, StopInsert } from '../types';

export async function getStops(tripId: string): Promise<Stop[]> {
  const { data, error } = await supabase
    .from('stops')
    .select('*')
    .eq('trip_id', tripId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createStop(stop: StopInsert): Promise<Stop> {
  const { data, error } = await supabase
    .from('stops')
    .insert(stop)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateStop(
  id: string,
  updates: Partial<StopInsert>
): Promise<Stop> {
  const { data, error } = await supabase
    .from('stops')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteStop(id: string): Promise<void> {
  const { error } = await supabase.from('stops').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderStops(orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('stops').update({ sort_order: index }).eq('id', id)
    )
  );
}

export async function updateStopStatus(
  id: string,
  status: 'upcoming' | 'current' | 'done'
): Promise<Stop> {
  const { data, error } = await supabase
    .from('stops')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
