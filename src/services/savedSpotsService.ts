import { supabase } from '../lib/supabase';
import type { SavedSpot, SavedSpotInsert, SavedSpotUpdate } from '../types';

export async function getSavedSpots(): Promise<SavedSpot[]> {
  const { data, error } = await supabase
    .from('saved_spots')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createSavedSpot(spot: SavedSpotInsert): Promise<SavedSpot> {
  const { data, error } = await supabase
    .from('saved_spots')
    .insert(spot)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSavedSpot(
  id: string,
  updates: SavedSpotUpdate,
): Promise<SavedSpot> {
  const { data, error } = await supabase
    .from('saved_spots')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSavedSpot(id: string): Promise<void> {
  const { error } = await supabase.from('saved_spots').delete().eq('id', id);
  if (error) throw error;
}

export async function importToTrip(
  spotId: string,
  tripId: string,
): Promise<SavedSpot> {
  const { data, error } = await supabase
    .from('saved_spots')
    .update({ imported_to_trip_id: tripId })
    .eq('id', spotId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
