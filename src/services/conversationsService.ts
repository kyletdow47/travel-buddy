import { supabase } from '../lib/supabase';
import type { Conversation } from '../types';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export async function getConversation(
  tripId: string
): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('trip_id', tripId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertConversation(
  tripId: string,
  messages: Message[]
): Promise<Conversation> {
  const { data, error } = await supabase
    .from('conversations')
    .upsert(
      {
        trip_id: tripId,
        messages: messages as unknown as Conversation['messages'],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'trip_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function appendMessage(
  tripId: string,
  message: Message
): Promise<Conversation> {
  const existing = await getConversation(tripId);
  const currentMessages = (existing?.messages ?? []) as unknown as Message[];
  const updatedMessages = [...currentMessages, message];
  return upsertConversation(tripId, updatedMessages);
}

export async function clearConversation(tripId: string): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .update({
      messages: [] as unknown as Conversation['messages'],
      updated_at: new Date().toISOString(),
    })
    .eq('trip_id', tripId);
  if (error) throw error;
}
