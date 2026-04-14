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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
