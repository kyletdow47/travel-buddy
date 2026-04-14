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
          cover_photo_url: string | null;
          cover_photo_attribution: string | null;
          source: string | null;
          timezone: string | null;
          country_code: string | null;
          country_flag: string | null;
          archived_at: string | null;
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
          cover_photo_url?: string | null;
          cover_photo_attribution?: string | null;
          source?: string | null;
          timezone?: string | null;
          country_code?: string | null;
          country_flag?: string | null;
          archived_at?: string | null;
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
          cover_photo_url?: string | null;
          cover_photo_attribution?: string | null;
          source?: string | null;
          timezone?: string | null;
          country_code?: string | null;
          country_flag?: string | null;
          archived_at?: string | null;
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
      packing_items: {
        Row: {
          id: string;
          trip_id: string | null;
          name: string;
          category: string | null;
          packed: boolean;
          assigned_to: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          trip_id?: string | null;
          name: string;
          category?: string | null;
          packed?: boolean;
          assigned_to?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          trip_id?: string | null;
          name?: string;
          category?: string | null;
          packed?: boolean;
          assigned_to?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'packing_items_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
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
      journal_entries: {
        Row: {
          id: string;
          trip_id: string | null;
          stop_id: string | null;
          title: string | null;
          body: string | null;
          photo_urls: Json;
          mood: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          trip_id?: string | null;
          stop_id?: string | null;
          title?: string | null;
          body?: string | null;
          photo_urls?: Json;
          mood?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          trip_id?: string | null;
          stop_id?: string | null;
          title?: string | null;
          body?: string | null;
          photo_urls?: Json;
          mood?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'journal_entries_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'journal_entries_stop_id_fkey';
            columns: ['stop_id'];
            isOneToOne: false;
            referencedRelation: 'stops';
            referencedColumns: ['id'];
          }
        ];
      };
      reservations: {
        Row: {
          id: string;
          trip_id: string | null;
          type: string;
          confirmation_code: string | null;
          provider: string | null;
          start_datetime: string | null;
          end_datetime: string | null;
          location: string | null;
          notes: string | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          trip_id?: string | null;
          type: string;
          confirmation_code?: string | null;
          provider?: string | null;
          start_datetime?: string | null;
          end_datetime?: string | null;
          location?: string | null;
          notes?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          trip_id?: string | null;
          type?: string;
          confirmation_code?: string | null;
          provider?: string | null;
          start_datetime?: string | null;
          end_datetime?: string | null;
          location?: string | null;
          notes?: string | null;
          status?: string | null;
          created_at?: string | null;
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
      notifications: {
        Row: {
          id: string;
          trip_id: string | null;
          title: string;
          body: string | null;
          type: string;
          read: boolean;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          trip_id?: string | null;
          title: string;
          body?: string | null;
          type?: string;
          read?: boolean;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          trip_id?: string | null;
          title?: string;
          body?: string | null;
          type?: string;
          read?: boolean;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          }
        ];
      };
      saved_spots: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          source_url: string | null;
          source_platform: string | null;
          image_url: string | null;
          location: string | null;
          lat: number | null;
          lng: number | null;
          notes: string | null;
          imported_to_trip_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          source_url?: string | null;
          source_platform?: string | null;
          image_url?: string | null;
          location?: string | null;
          lat?: number | null;
          lng?: number | null;
          notes?: string | null;
          imported_to_trip_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          source_url?: string | null;
          source_platform?: string | null;
          image_url?: string | null;
          location?: string | null;
          lat?: number | null;
          lng?: number | null;
          notes?: string | null;
          imported_to_trip_id?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
