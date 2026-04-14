import type { Database } from './supabase';

export type { Database, Json } from './supabase';

export type Trip = Database['public']['Tables']['trips']['Row'];
export type TripInsert = Database['public']['Tables']['trips']['Insert'];
export type TripUpdate = Database['public']['Tables']['trips']['Update'];

export type Stop = Database['public']['Tables']['stops']['Row'];
export type StopInsert = Database['public']['Tables']['stops']['Insert'];
export type StopUpdate = Database['public']['Tables']['stops']['Update'];

export type Receipt = Database['public']['Tables']['receipts']['Row'];
export type ReceiptInsert = Database['public']['Tables']['receipts']['Insert'];
export type ReceiptUpdate = Database['public']['Tables']['receipts']['Update'];

export type PackingItem = Database['public']['Tables']['packing_items']['Row'];
export type PackingItemInsert = Database['public']['Tables']['packing_items']['Insert'];
export type PackingItemUpdate = Database['public']['Tables']['packing_items']['Update'];

export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert'];
export type ConversationUpdate = Database['public']['Tables']['conversations']['Update'];

export type Reservation = Database['public']['Tables']['reservations']['Row'];
export type ReservationInsert = Database['public']['Tables']['reservations']['Insert'];
export type ReservationUpdate = Database['public']['Tables']['reservations']['Update'];

export type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
export type JournalEntryInsert = Database['public']['Tables']['journal_entries']['Insert'];
export type JournalEntryUpdate = Database['public']['Tables']['journal_entries']['Update'];

export type AppNotification = Database['public']['Tables']['notifications']['Row'];
export type AppNotificationInsert = Database['public']['Tables']['notifications']['Insert'];
export type AppNotificationUpdate = Database['public']['Tables']['notifications']['Update'];

export type SavedSpot = Database['public']['Tables']['saved_spots']['Row'];
export type SavedSpotInsert = Database['public']['Tables']['saved_spots']['Insert'];
export type SavedSpotUpdate = Database['public']['Tables']['saved_spots']['Update'];
