// TypeScript types for Supabase Database
// TODO: Generate types from Supabase CLI: npx supabase gen types typescript --project-id your-project-id

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
      // Database types will be defined here
    }
    Views: {
      // Database views will be defined here
    }
    Functions: {
      // Database functions will be defined here
    }
    Enums: {
      // Database enums will be defined here
    }
  }
}
