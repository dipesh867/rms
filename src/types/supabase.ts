export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'owner' | 'manager' | 'staff' | 'kitchen' | 'vendor' | 'customer'
          status: 'active' | 'inactive' | 'suspended'
          last_login: string | null
          created_at: string
          avatar_url: string | null
          phone: string | null
          department: string | null
          restaurant_id: string | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          role: 'admin' | 'owner' | 'manager' | 'staff' | 'kitchen' | 'vendor' | 'customer'
          status?: 'active' | 'inactive' | 'suspended'
          last_login?: string | null
          created_at?: string
          avatar_url?: string | null
          phone?: string | null
          department?: string | null
          restaurant_id?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'owner' | 'manager' | 'staff' | 'kitchen' | 'vendor' | 'customer'
          status?: 'active' | 'inactive' | 'suspended'
          last_login?: string | null
          created_at?: string
          avatar_url?: string | null
          phone?: string | null
          department?: string | null
          restaurant_id?: string | null
        }
      }
      restaurants: {
        Row: {
          id: string
          name: string
          address: string
          phone: string
          email: string
          logo_url: string | null
          created_at: string
          owner_id: string
          status: 'active' | 'inactive'
        }
        Insert: {
          id?: string
          name: string
          address: string
          phone: string
          email: string
          logo_url?: string | null
          created_at?: string
          owner_id: string
          status?: 'active' | 'inactive'
        }
        Update: {
          id?: string
          name?: string
          address?: string
          phone?: string
          email?: string
          logo_url?: string | null
          created_at?: string
          owner_id?: string
          status?: 'active' | 'inactive'
        }
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