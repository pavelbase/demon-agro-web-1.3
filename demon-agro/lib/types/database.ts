// TypeScript types for Supabase Database
// TODO: Generate types from Supabase CLI after setting up the database:
// npx supabase gen types typescript --project-id your-project-id > lib/types/database.ts

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
      // User profiles
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          phone: string | null
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          phone?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          phone?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      
      // Additional tables will be defined here as the database schema is created
    }
    Views: {
      // Database views will be defined here
    }
    Functions: {
      // Database functions will be defined here
    }
    Enums: {
      user_role: 'user' | 'admin'
      soil_type: 'light' | 'medium' | 'heavy'
      quote_status: 'pending' | 'approved' | 'rejected' | 'completed'
    }
  }
}

// Helper types for working with Supabase
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
