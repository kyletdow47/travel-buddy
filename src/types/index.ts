import type { Database } from './supabase';

export type {
  Database,
  Json,
  ReservationType,
  ReservationStatus,
  ReservationSource,
} from './supabase';

export type Trip = Database['public']['Tables']['trips']['Row'];
export type TripInsert = Database['public']['Tables']['trips']['Insert'];
export type TripUpdate = Database['public']['Tables']['trips']['Update'];

export type Stop = Database['public']['Tables']['stops']['Row'];
export type StopInsert = Database['public']['Tables']['stops']['Insert'];
export type StopUpdate = Database['public']['Tables']['stops']['Update'];

export type Receipt = Database['public']['Tables']['receipts']['Row'];
export type ReceiptInsert = Database['public']['Tables']['receipts']['Insert'];
export type ReceiptUpdate = Database['public']['Tables']['receipts']['Update'];

export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type ConversationInsert =
  Database['public']['Tables']['conversations']['Insert'];
export type ConversationUpdate =
  Database['public']['Tables']['conversations']['Update'];

// --- Reservations ---
export type Reservation =
  Database['public']['Tables']['reservations']['Row'];
export type ReservationInsert =
  Database['public']['Tables']['reservations']['Insert'];
export type ReservationUpdate =
  Database['public']['Tables']['reservations']['Update'];

export type ReservationFlight =
  Database['public']['Tables']['reservation_flights']['Row'];
export type ReservationFlightInsert =
  Database['public']['Tables']['reservation_flights']['Insert'];
export type ReservationFlightUpdate =
  Database['public']['Tables']['reservation_flights']['Update'];

export type ReservationLodging =
  Database['public']['Tables']['reservation_lodging']['Row'];
export type ReservationLodgingInsert =
  Database['public']['Tables']['reservation_lodging']['Insert'];
export type ReservationLodgingUpdate =
  Database['public']['Tables']['reservation_lodging']['Update'];

export type ReservationCar =
  Database['public']['Tables']['reservation_cars']['Row'];
export type ReservationCarInsert =
  Database['public']['Tables']['reservation_cars']['Insert'];
export type ReservationCarUpdate =
  Database['public']['Tables']['reservation_cars']['Update'];

export type ReservationTrain =
  Database['public']['Tables']['reservation_trains']['Row'];
export type ReservationTrainInsert =
  Database['public']['Tables']['reservation_trains']['Insert'];
export type ReservationTrainUpdate =
  Database['public']['Tables']['reservation_trains']['Update'];

export type ReservationActivity =
  Database['public']['Tables']['reservation_activities']['Row'];
export type ReservationActivityInsert =
  Database['public']['Tables']['reservation_activities']['Insert'];
export type ReservationActivityUpdate =
  Database['public']['Tables']['reservation_activities']['Update'];

/**
 * A base reservation joined with its type-specific detail row.
 * Only the field matching `reservation.type` will be populated.
 */
export type ReservationWithDetails = Reservation & {
  flight?: ReservationFlight[];
  lodging?: ReservationLodging | null;
  car?: ReservationCar | null;
  train?: ReservationTrain[];
  activity?: ReservationActivity | null;
};
