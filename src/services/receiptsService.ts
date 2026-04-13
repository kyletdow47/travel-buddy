import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';
import type { Receipt, ReceiptInsert } from '../types';

export async function getReceipt(id: string): Promise<Receipt> {
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getReceipts(tripId: string): Promise<Receipt[]> {
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .eq('trip_id', tripId)
    .order('receipt_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createReceipt(receipt: ReceiptInsert): Promise<Receipt> {
  const { data, error } = await supabase
    .from('receipts')
    .insert(receipt)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateReceipt(
  id: string,
  updates: Partial<ReceiptInsert>
): Promise<Receipt> {
  const { data, error } = await supabase
    .from('receipts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteReceipt(id: string): Promise<void> {
  const { error } = await supabase.from('receipts').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadReceiptImage(
  uri: string,
  receiptId: string
): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: 'base64',
  });
  const filePath = `${receiptId}.jpg`;
  const { error } = await supabase.storage
    .from('receipts')
    .upload(filePath, decode(base64), {
      contentType: 'image/jpeg',
      upsert: true,
    });
  if (error) throw error;

  const { data } = supabase.storage.from('receipts').getPublicUrl(filePath);
  return data.publicUrl;
}

export async function syncTripSpent(tripId: string): Promise<void> {
  const { data, error } = await supabase
    .from('receipts')
    .select('amount')
    .eq('trip_id', tripId);
  if (error) throw error;

  const spent = (data ?? []).reduce(
    (sum, receipt) => sum + (receipt.amount ?? 0),
    0
  );
  const { error: updateError } = await supabase
    .from('trips')
    .update({ spent })
    .eq('id', tripId);
  if (updateError) throw updateError;
}
