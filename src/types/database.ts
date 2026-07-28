export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      almanac_routes: {
        Row: {
          assessment: string | null
          back: string | null
          created_at: string | null
          day1: string | null
          day2: string | null
          difficulty: string | null
          distance_km: number | null
          friday_night: string | null
          gain_m: number | null
          hut_name: string | null
          hut_phone: string | null
          id: string
          km_note: string | null
          loss_m: number | null
          name: string
          practical_rank: number | null
          region: string
          suited_for: string | null
          terrain: string | null
          verified: boolean | null
        }
        Insert: {
          assessment?: string | null
          back?: string | null
          created_at?: string | null
          day1?: string | null
          day2?: string | null
          difficulty?: string | null
          distance_km?: number | null
          friday_night?: string | null
          gain_m?: number | null
          hut_name?: string | null
          hut_phone?: string | null
          id: string
          km_note?: string | null
          loss_m?: number | null
          name: string
          practical_rank?: number | null
          region: string
          suited_for?: string | null
          terrain?: string | null
          verified?: boolean | null
        }
        Update: {
          assessment?: string | null
          back?: string | null
          created_at?: string | null
          day1?: string | null
          day2?: string | null
          difficulty?: string | null
          distance_km?: number | null
          friday_night?: string | null
          gain_m?: number | null
          hut_name?: string | null
          hut_phone?: string | null
          id?: string
          km_note?: string | null
          loss_m?: number | null
          name?: string
          practical_rank?: number | null
          region?: string
          suited_for?: string | null
          terrain?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      custom_routes: {
        Row: {
          created_at: string | null
          days: Json | null
          difficulty: string | null
          distance_km: number | null
          gain_m: number | null
          huts: Json | null
          id: string
          name: string
          region: string | null
          risks: string | null
          transport_note: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          days?: Json | null
          difficulty?: string | null
          distance_km?: number | null
          gain_m?: number | null
          huts?: Json | null
          id?: string
          name: string
          region?: string | null
          risks?: string | null
          transport_note?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          days?: Json | null
          difficulty?: string | null
          distance_km?: number | null
          gain_m?: number | null
          huts?: Json | null
          id?: string
          name?: string
          region?: string | null
          risks?: string | null
          transport_note?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      imported_routes: {
        Row: {
          created_at: string | null
          id: string
          route_data: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          route_data: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          route_data?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      routes: {
        Row: {
          accommodation: Json | null
          avtogari_link: string | null
          bdz_link: string | null
          bus_link: string | null
          created_at: string | null
          date_end: string | null
          date_start: string | null
          days: Json | null
          difficulty: string | null
          distance_km: number | null
          forecast_link: string | null
          from_point: string | null
          gain_m: number | null
          huts: Json | null
          id: string
          kind: string
          loss_m: number | null
          name: string
          notes_default: string | null
          region: string
          risk: Json | null
          route_line: string | null
          season: string | null
          status: string | null
          taxis: Json | null
          to_point: string | null
          transport: Json | null
          updated_at: string | null
          verification_level: string | null
          windy_embed: string | null
        }
        Insert: {
          accommodation?: Json | null
          avtogari_link?: string | null
          bdz_link?: string | null
          bus_link?: string | null
          created_at?: string | null
          date_end?: string | null
          date_start?: string | null
          days?: Json | null
          difficulty?: string | null
          distance_km?: number | null
          forecast_link?: string | null
          from_point?: string | null
          gain_m?: number | null
          huts?: Json | null
          id: string
          kind?: string
          loss_m?: number | null
          name: string
          notes_default?: string | null
          region: string
          risk?: Json | null
          route_line?: string | null
          season?: string | null
          status?: string | null
          taxis?: Json | null
          to_point?: string | null
          transport?: Json | null
          updated_at?: string | null
          verification_level?: string | null
          windy_embed?: string | null
        }
        Update: {
          accommodation?: Json | null
          avtogari_link?: string | null
          bdz_link?: string | null
          bus_link?: string | null
          created_at?: string | null
          date_end?: string | null
          date_start?: string | null
          days?: Json | null
          difficulty?: string | null
          distance_km?: number | null
          forecast_link?: string | null
          from_point?: string | null
          gain_m?: number | null
          huts?: Json | null
          id?: string
          kind?: string
          loss_m?: number | null
          name?: string
          notes_default?: string | null
          region?: string
          risk?: Json | null
          route_line?: string | null
          season?: string | null
          status?: string | null
          taxis?: Json | null
          to_point?: string | null
          transport?: Json | null
          updated_at?: string | null
          verification_level?: string | null
          windy_embed?: string | null
        }
        Relationships: []
      }
      user_completions: {
        Row: {
          completion_date: string | null
          created_at: string | null
          id: string
          note: string | null
          route_id: string
          user_id: string | null
        }
        Insert: {
          completion_date?: string | null
          created_at?: string | null
          id?: string
          note?: string | null
          route_id: string
          user_id?: string | null
        }
        Update: {
          completion_date?: string | null
          created_at?: string | null
          id?: string
          note?: string | null
          route_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          route_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          route_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          route_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_gear_state: {
        Row: {
          created_at: string | null
          gear_state: Json | null
          id: string
          route_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          gear_state?: Json | null
          id?: string
          route_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          gear_state?: Json | null
          id?: string
          route_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_notes: {
        Row: {
          created_at: string | null
          id: string
          note: string
          route_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          note: string
          route_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          note?: string
          route_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_route_overrides: {
        Row: {
          created_at: string | null
          id: string
          overrides: Json | null
          route_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          overrides?: Json | null
          route_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          overrides?: Json | null
          route_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
