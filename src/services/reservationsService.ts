import { supabase } from '../lib/supabase';
import type { Reservation, ReservationInsert } from '../types';

export async function getReservations(tripId: string): Promise<Reservation[]> {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('trip_id', tripId)
    .order('start_datetime', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createReservation(
  reservation: ReservationInsert,
): Promise<Reservation> {
  const { data, error } = await supabase
    .from('reservations')
    .insert(reservation)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateReservation(
  id: string,
  updates: Partial<ReservationInsert>,
): Promise<Reservation> {
  const { data, error } = await supabase
    .from('reservations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteReservation(id: string): Promise<void> {
  const { error } = await supabase.from('reservations').delete().eq('id', id);
  if (error) throw error;
}
