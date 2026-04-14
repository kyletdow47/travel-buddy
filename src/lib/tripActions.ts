import { supabase } from './supabase';
import type { Trip, TripInsert, Stop } from '../types';

// ──────────────────────────────────────────────
// Trip mutation helpers: archive / unarchive / delete / duplicate.
// These live in a single module so callers (list row swipes, detail
// sheet action menu, AI assistant) can share exact behavior.
// ──────────────────────────────────────────────

export async function archiveTrip(tripId: string): Promise<Trip> {
  const { data, error } = await supabase
    .from('trips')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', tripId)
    .select()
    .single();
  if (error) throw error;
  return data as Trip;
}

export async function unarchiveTrip(tripId: string): Promise<Trip> {
  const { data, error } = await supabase
    .from('trips')
    .update({ archived_at: null })
    .eq('id', tripId)
    .select()
    .single();
  if (error) throw error;
  return data as Trip;
}

/**
 * Permanent delete — cascades to stops/receipts/conversations via FK constraints.
 * Prefer {@link archiveTrip} for user-initiated "Delete" unless we've confirmed
 * the destructive intent.
 */
export async function deleteTrip(tripId: string): Promise<void> {
  const { error } = await supabase.from('trips').delete().eq('id', tripId);
  if (error) throw error;
}

type DuplicateOptions = {
  /** Override the new trip name. Default: "<original name> (Copy)". */
  newName?: string;
  /** Include stops in the duplicate. Default true. */
  includeStops?: boolean;
  /** Shift the new trip's dates by this many days (start+end). Default 0. */
  dateOffsetDays?: number;
};

function shiftDate(iso: string | null, days: number): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Duplicate a trip and (by default) its stops.
 * Returns the newly created Trip row.
 */
export async function duplicateTrip(
  tripId: string,
  opts: DuplicateOptions = {},
): Promise<Trip> {
  const { newName, includeStops = true, dateOffsetDays = 0 } = opts;

  const { data: original, error: getErr } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single();
  if (getErr) throw getErr;
  if (!original) throw new Error('Trip not found');

  const payload: TripInsert = {
    name: newName ?? `${original.name} (Copy)`,
    start_date: shiftDate(original.start_date, dateOffsetDays),
    end_date: shiftDate(original.end_date, dateOffsetDays),
    budget: original.budget,
    spent: 0,
    status: 'planning',
    cover_photo_url: (original as Trip & { cover_photo_url?: string | null })
      .cover_photo_url,
    cover_photo_attribution: (
      original as Trip & { cover_photo_attribution?: string | null }
    ).cover_photo_attribution,
    source: 'manual',
    timezone: (original as Trip & { timezone?: string | null }).timezone,
    country_code: (original as Trip & { country_code?: string | null }).country_code,
    country_flag: (original as Trip & { country_flag?: string | null }).country_flag,
  };

  const { data: created, error: createErr } = await supabase
    .from('trips')
    .insert(payload)
    .select()
    .single();
  if (createErr) throw createErr;
  const newTrip = created as Trip;

  if (includeStops) {
    const { data: stops, error: stopsErr } = await supabase
      .from('stops')
      .select('*')
      .eq('trip_id', tripId);
    if (stopsErr) throw stopsErr;

    if (stops && stops.length > 0) {
      const stopsPayload = (stops as Stop[]).map((s) => ({
        trip_id: newTrip.id,
        name: s.name,
        location: s.location,
        lat: s.lat,
        lng: s.lng,
        category: s.category,
        planned_date: shiftDate(s.planned_date, dateOffsetDays),
        status: 'upcoming',
        notes: s.notes,
        sort_order: s.sort_order,
      }));
      const { error: insertErr } = await supabase.from('stops').insert(stopsPayload);
      if (insertErr) throw insertErr;
    }
  }

  return newTrip;
}
