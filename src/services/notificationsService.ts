import { supabase } from '../lib/supabase';
import type { AppNotification } from '../types';

export async function getNotifications(): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function markRead(id: string): Promise<AppNotification> {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function markAllRead(): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('read', false);
  if (error) throw error;
}

export async function deleteNotification(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
