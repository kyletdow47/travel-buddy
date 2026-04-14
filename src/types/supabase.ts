export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      trips: {
        Row: {
          id: string;
          name: string;
          start_date: string | null;
          end_date: string | null;
          budget: number | null;
          spent: number | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          spent?: number | null;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          spent?: number | null;
          status?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      stops: {
        Row: {
          id: string;
          trip_id: string | null;
          name: string;
          location: string | null;
          lat: number | null;
          lng: number | null;
          category: string | null;
          planned_date: string | null;
          status: string | null;
          notes: string | null;
          sort_order: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          trip_id?: string | null;
          name: string;
          location?: string | null;
          lat?: number | null;
          lng?: number | null;
          category?: string | null;
          planned_date?: string | null;
          status?: string | null;
          notes?: string | null;
          sort_order?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          trip_id?: string | null;
          name?: string;
          location?: string | null;
          lat?: number | null;
          lng?: number | null;
          category?: string | null;
          planned_date?: string | null;
          status?: string | null;
          notes?: string | null;
          sort_order?: number | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'stops_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          }
        ];
      };
      receipts: {
        Row: {
          id: string;
          trip_id: string | null;
          stop_id: string | null;
          merchant: string | null;
          amount: number;
          category: string | null;
          receipt_date: string | null;
          image_url: string | null;
          notes: string | null;
          lat: number | null;
          lng: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          trip_id?: string | null;
          stop_id?: string | null;
          merchant?: string | null;
          amount: number;
          category?: string | null;
          receipt_date?: string | null;
          image_url?: string | null;
          notes?: string | null;
          lat?: number | null;
          lng?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          trip_id?: string | null;
          stop_id?: string | null;
          merchant?: string | null;
          amount?: number;
          category?: string | null;
          receipt_date?: string | null;
          image_url?: string | null;
          notes?: string | null;
          lat?: number | null;
          lng?: number | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'receipts_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'receipts_stop_id_fkey';
            columns: ['stop_id'];
            isOneToOne: false;
            referencedRelation: 'stops';
            referencedColumns: ['id'];
          }
        ];
      };
      conversations: {
        Row: {
          id: string;
          trip_id: string | null;
          messages: Json | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          trip_id?: string | null;
          messages?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          trip_id?: string | null;
          messages?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'conversations_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          }
        ];
      };
      reservations: {
        Row: {
          id: string;
          trip_id: string | null;
          type: ReservationType;
          status: ReservationStatus;
          source: ReservationSource;
          title: string;
          provider: string | null;
          confirmation_number: string | null;
          total_cost: number | null;
          currency: string | null;
          start_at: string | null;
          end_at: string | null;
          notes: string | null;
          raw_payload: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id?: string | null;
          type: ReservationType;
          status?: ReservationStatus;
          source?: ReservationSource;
          title: string;
          provider?: string | null;
          confirmation_number?: string | null;
          total_cost?: number | null;
          currency?: string | null;
          start_at?: string | null;
          end_at?: string | null;
          notes?: string | null;
          raw_payload?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string | null;
          type?: ReservationType;
          status?: ReservationStatus;
          source?: ReservationSource;
          title?: string;
          provider?: string | null;
          confirmation_number?: string | null;
          total_cost?: number | null;
          currency?: string | null;
          start_at?: string | null;
          end_at?: string | null;
          notes?: string | null;
          raw_payload?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reservations_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          }
        ];
      };
      reservation_flights: {
        Row: {
          id: string;
          reservation_id: string;
          leg_index: number;
          airline: string | null;
          flight_number: string | null;
          origin_airport: string | null;
          origin_city: string | null;
          origin_terminal: string | null;
          destination_airport: string | null;
          destination_city: string | null;
          destination_terminal: string | null;
          departure_at: string | null;
          arrival_at: string | null;
          cabin_class: string | null;
          seat: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reservation_id: string;
          leg_index?: number;
          airline?: string | null;
          flight_number?: string | null;
          origin_airport?: string | null;
          origin_city?: string | null;
          origin_terminal?: string | null;
          destination_airport?: string | null;
          destination_city?: string | null;
          destination_terminal?: string | null;
          departure_at?: string | null;
          arrival_at?: string | null;
          cabin_class?: string | null;
          seat?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reservation_id?: string;
          leg_index?: number;
          airline?: string | null;
          flight_number?: string | null;
          origin_airport?: string | null;
          origin_city?: string | null;
          origin_terminal?: string | null;
          destination_airport?: string | null;
          destination_city?: string | null;
          destination_terminal?: string | null;
          departure_at?: string | null;
          arrival_at?: string | null;
          cabin_class?: string | null;
          seat?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reservation_flights_reservation_id_fkey';
            columns: ['reservation_id'];
            isOneToOne: false;
            referencedRelation: 'reservations';
            referencedColumns: ['id'];
          }
        ];
      };
      reservation_lodging: {
        Row: {
          id: string;
          reservation_id: string;
          property_name: string | null;
          address: string | null;
          city: string | null;
          country: string | null;
          lat: number | null;
          lng: number | null;
          check_in_at: string | null;
          check_out_at: string | null;
          room_type: string | null;
          num_guests: number | null;
          nightly_rate: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reservation_id: string;
          property_name?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          lat?: number | null;
          lng?: number | null;
          check_in_at?: string | null;
          check_out_at?: string | null;
          room_type?: string | null;
          num_guests?: number | null;
          nightly_rate?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reservation_id?: string;
          property_name?: string | null;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          lat?: number | null;
          lng?: number | null;
          check_in_at?: string | null;
          check_out_at?: string | null;
          room_type?: string | null;
          num_guests?: number | null;
          nightly_rate?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reservation_lodging_reservation_id_fkey';
            columns: ['reservation_id'];
            isOneToOne: false;
            referencedRelation: 'reservations';
            referencedColumns: ['id'];
          }
        ];
      };
      reservation_cars: {
        Row: {
          id: string;
          reservation_id: string;
          rental_company: string | null;
          vehicle_class: string | null;
          vehicle_description: string | null;
          pickup_location: string | null;
          pickup_at: string | null;
          dropoff_location: string | null;
          dropoff_at: string | null;
          driver_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reservation_id: string;
          rental_company?: string | null;
          vehicle_class?: string | null;
          vehicle_description?: string | null;
          pickup_location?: string | null;
          pickup_at?: string | null;
          dropoff_location?: string | null;
          dropoff_at?: string | null;
          driver_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reservation_id?: string;
          rental_company?: string | null;
          vehicle_class?: string | null;
          vehicle_description?: string | null;
          pickup_location?: string | null;
          pickup_at?: string | null;
          dropoff_location?: string | null;
          dropoff_at?: string | null;
          driver_name?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reservation_cars_reservation_id_fkey';
            columns: ['reservation_id'];
            isOneToOne: false;
            referencedRelation: 'reservations';
            referencedColumns: ['id'];
          }
        ];
      };
      reservation_trains: {
        Row: {
          id: string;
          reservation_id: string;
          leg_index: number;
          operator: string | null;
          train_number: string | null;
          origin_station: string | null;
          origin_city: string | null;
          destination_station: string | null;
          destination_city: string | null;
          departure_at: string | null;
          arrival_at: string | null;
          car: string | null;
          seat: string | null;
          fare_class: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reservation_id: string;
          leg_index?: number;
          operator?: string | null;
          train_number?: string | null;
          origin_station?: string | null;
          origin_city?: string | null;
          destination_station?: string | null;
          destination_city?: string | null;
          departure_at?: string | null;
          arrival_at?: string | null;
          car?: string | null;
          seat?: string | null;
          fare_class?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reservation_id?: string;
          leg_index?: number;
          operator?: string | null;
          train_number?: string | null;
          origin_station?: string | null;
          origin_city?: string | null;
          destination_station?: string | null;
          destination_city?: string | null;
          departure_at?: string | null;
          arrival_at?: string | null;
          car?: string | null;
          seat?: string | null;
          fare_class?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reservation_trains_reservation_id_fkey';
            columns: ['reservation_id'];
            isOneToOne: false;
            referencedRelation: 'reservations';
            referencedColumns: ['id'];
          }
        ];
      };
      reservation_activities: {
        Row: {
          id: string;
          reservation_id: string;
          activity_name: string | null;
          vendor: string | null;
          location: string | null;
          lat: number | null;
          lng: number | null;
          starts_at: string | null;
          ends_at: string | null;
          num_participants: number | null;
          meeting_point: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reservation_id: string;
          activity_name?: string | null;
          vendor?: string | null;
          location?: string | null;
          lat?: number | null;
          lng?: number | null;
          starts_at?: string | null;
          ends_at?: string | null;
          num_participants?: number | null;
          meeting_point?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reservation_id?: string;
          activity_name?: string | null;
          vendor?: string | null;
          location?: string | null;
          lat?: number | null;
          lng?: number | null;
          starts_at?: string | null;
          ends_at?: string | null;
          num_participants?: number | null;
          meeting_point?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reservation_activities_reservation_id_fkey';
            columns: ['reservation_id'];
            isOneToOne: false;
            referencedRelation: 'reservations';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      reservation_type: ReservationType;
      reservation_status: ReservationStatus;
      reservation_source: ReservationSource;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type ReservationType =
  | 'flight'
  | 'lodging'
  | 'car'
  | 'train'
  | 'activity';

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export type ReservationSource = 'manual' | 'email' | 'import';
