// TypeScript types for Supabase Database
// Auto-generated types based on database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================================================
// ENUMS
// ============================================================================

export type UserRole = 'admin' | 'user'
export type SoilType = 'L' | 'S' | 'T' // Lehká, Střední, Těžká
export type Culture = 'orna' | 'ttp' // Orná půda, Travní trvalý porost
export type NutrientCategory = 'nizky' | 'vyhovujici' | 'dobry' | 'vysoky' | 'velmi_vysoky' // Nízký, Vyhovující, Dobrý, Vysoký, Velmi Vysoký
export type PhCategory = 'extremne_kysela' | 'silne_kysela' | 'slabe_kysela' | 'neutralni' | 'slabe_alkalicka' | 'alkalicka' // Extrémně kyselá, Silně kyselá, Slabě kyselá, Neutrální, Slabě alkalická, Alkalická
export type RequestStatus = 'new' | 'in_progress' | 'quoted' | 'completed' | 'cancelled'
export type LimeType = 'calcitic' | 'dolomite' | 'either' // Vápenatý, Dolomitový, Libovolný
export type LimeProductType = 'calcitic' | 'dolomite' | 'both' // Pro liming_products tabulku
export type Reactivity = 'low' | 'medium' | 'high' | 'very_high'
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order'

// ============================================================================
// DATABASE INTERFACE
// ============================================================================

export interface Database {
  public: {
    Tables: {
      // ======================================================================
      // PROFILES (User Profiles)
      // ======================================================================
      profiles: {
        Row: {
          id: string
          email: string
          company_name: string | null
          ico: string | null
          address: string | null
          district: string | null
          phone: string | null
          role: UserRole
          is_active: boolean
          must_change_password: boolean
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          company_name?: string | null
          ico?: string | null
          address?: string | null
          district?: string | null
          phone?: string | null
          role?: UserRole
          is_active?: boolean
          must_change_password?: boolean
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          company_name?: string | null
          ico?: string | null
          address?: string | null
          district?: string | null
          phone?: string | null
          role?: UserRole
          is_active?: boolean
          must_change_password?: boolean
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      // ======================================================================
      // PARCELS (Pozemky)
      // ======================================================================
      parcels: {
        Row: {
          id: string
          user_id: string
          name: string
          area: number
          code: string | null
          soil_type: SoilType
          culture: Culture
          notes: string | null
          status: 'active' | 'archived'
          source_parcel_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          area: number
          code?: string | null
          soil_type?: SoilType | null
          culture?: Culture
          notes?: string | null
          status?: 'active' | 'archived'
          source_parcel_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          area?: number
          code?: string | null
          soil_type?: SoilType | null
          culture?: Culture
          notes?: string | null
          status?: 'active' | 'archived'
          source_parcel_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // ======================================================================
      // SOIL ANALYSES (Rozbory půdy)
      // ======================================================================
      soil_analyses: {
        Row: {
          id: string
          parcel_id: string
          analysis_date: string
          methodology: string | null
          ph: number
          ph_category: PhCategory | null
          p: number
          p_category: NutrientCategory | null
          k: number
          k_category: NutrientCategory | null
          mg: number
          mg_category: NutrientCategory | null
          ca: number | null
          ca_category: NutrientCategory | null
          s: number | null
          s_category: NutrientCategory | null
          k_mg_ratio: number | null
          source_document: string | null
          ai_extracted: boolean
          user_validated: boolean
          is_current: boolean
          kvk: number | null
          base_saturation: number | null
          version_number: number | null
          extraction_confidence: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parcel_id: string
          analysis_date: string
          methodology?: string | null
          ph: number
          ph_category?: PhCategory | null
          p: number
          p_category?: NutrientCategory | null
          k: number
          k_category?: NutrientCategory | null
          mg: number
          mg_category?: NutrientCategory | null
          ca?: number | null
          ca_category?: NutrientCategory | null
          s?: number | null
          s_category?: NutrientCategory | null
          k_mg_ratio?: number | null
          source_document?: string | null
          ai_extracted?: boolean
          user_validated?: boolean
          is_current?: boolean
          kvk?: number | null
          base_saturation?: number | null
          version_number?: number | null
          extraction_confidence?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parcel_id?: string
          analysis_date?: string
          methodology?: string | null
          ph?: number
          ph_category?: PhCategory | null
          p?: number
          p_category?: NutrientCategory | null
          k?: number
          k_category?: NutrientCategory | null
          mg?: number
          mg_category?: NutrientCategory | null
          ca?: number | null
          ca_category?: NutrientCategory | null
          s?: number | null
          s_category?: NutrientCategory | null
          k_mg_ratio?: number | null
          source_document?: string | null
          ai_extracted?: boolean
          user_validated?: boolean
          is_current?: boolean
          kvk?: number | null
          base_saturation?: number | null
          version_number?: number | null
          extraction_confidence?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // ======================================================================
      // FERTILIZATION HISTORY (Historie hnojení)
      // ======================================================================
      fertilization_history: {
        Row: {
          id: string
          parcel_id: string
          user_id: string
          date: string
          product_name: string
          quantity: number
          unit: string
          nitrogen: number | null
          phosphorus: number | null
          potassium: number | null
          magnesium: number | null
          calcium: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parcel_id: string
          user_id: string
          date: string
          product_name: string
          quantity: number
          unit?: string
          nitrogen?: number | null
          phosphorus?: number | null
          potassium?: number | null
          magnesium?: number | null
          calcium?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parcel_id?: string
          user_id?: string
          date?: string
          product_name?: string
          quantity?: number
          unit?: string
          nitrogen?: number | null
          phosphorus?: number | null
          potassium?: number | null
          magnesium?: number | null
          calcium?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // ======================================================================
      // CROP ROTATION (Osevní postup)
      // ======================================================================
      crop_rotation: {
        Row: {
          id: string
          parcel_id: string
          user_id: string
          year: number
          crop_name: string
          expected_yield: number | null
          actual_yield: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parcel_id: string
          user_id: string
          year: number
          crop_name: string
          expected_yield?: number | null
          actual_yield?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parcel_id?: string
          user_id?: string
          year?: number
          crop_name?: string
          expected_yield?: number | null
          actual_yield?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // ======================================================================
      // FERTILIZATION PLANS (Plány hnojení)
      // ======================================================================
      fertilization_plans: {
        Row: {
          id: string
          parcel_id: string
          user_id: string
          soil_analysis_id: string | null
          year: number
          crop_name: string
          expected_yield: number | null
          nitrogen_need: number
          phosphorus_need: number
          potassium_need: number
          magnesium_need: number | null
          nitrogen_supplied: number | null
          phosphorus_supplied: number | null
          potassium_supplied: number | null
          magnesium_supplied: number | null
          recommended_products: Json | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parcel_id: string
          user_id: string
          soil_analysis_id?: string | null
          year: number
          crop_name: string
          expected_yield?: number | null
          nitrogen_need: number
          phosphorus_need: number
          potassium_need: number
          magnesium_need?: number | null
          nitrogen_supplied?: number | null
          phosphorus_supplied?: number | null
          potassium_supplied?: number | null
          magnesium_supplied?: number | null
          recommended_products?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parcel_id?: string
          user_id?: string
          soil_analysis_id?: string | null
          year?: number
          crop_name?: string
          expected_yield?: number | null
          nitrogen_need?: number
          phosphorus_need?: number
          potassium_need?: number
          magnesium_need?: number | null
          nitrogen_supplied?: number | null
          phosphorus_supplied?: number | null
          potassium_supplied?: number | null
          magnesium_supplied?: number | null
          recommended_products?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // ======================================================================
      // PRODUCTS (Produkty hnojení)
      // ======================================================================
      products: {
        Row: {
          id: string
          name: string
          type: 'fertilizer' | 'lime'
          description: string | null
          nitrogen: number | null
          phosphorus: number | null
          potassium: number | null
          magnesium: number | null
          calcium: number | null
          cao: number | null
          mgo: number | null
          lime_type: LimeType | null
          neutralization_value: number | null
          price: number | null
          unit: string
          is_active: boolean
          display_order: number | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'fertilizer' | 'lime'
          description?: string | null
          nitrogen?: number | null
          phosphorus?: number | null
          potassium?: number | null
          magnesium?: number | null
          calcium?: number | null
          cao?: number | null
          mgo?: number | null
          lime_type?: LimeType | null
          neutralization_value?: number | null
          price?: number | null
          unit?: string
          is_active?: boolean
          display_order?: number | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'fertilizer' | 'lime'
          description?: string | null
          nitrogen?: number | null
          phosphorus?: number | null
          potassium?: number | null
          magnesium?: number | null
          calcium?: number | null
          cao?: number | null
          mgo?: number | null
          lime_type?: LimeType | null
          neutralization_value?: number | null
          price?: number | null
          unit?: string
          is_active?: boolean
          display_order?: number | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // ======================================================================
      // LIMING PRODUCTS (Produkty vápnění)
      // ======================================================================
      liming_products: {
        Row: {
          id: string
          name: string
          description: string | null
          type: LimeProductType
          cao_content: number
          mgo_content: number
          reactivity: Reactivity | null
          moisture_content: number | null
          particles_over_1mm: number | null
          particles_under_05mm: number | null
          particles_009_05mm: number | null
          granulation: string | null
          form: string | null
          is_active: boolean
          stock_status: StockStatus
          display_order: number
          image_url: string | null
          notes: string | null
          application_notes: string | null
          price_per_ton: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: LimeProductType
          cao_content: number
          mgo_content?: number
          reactivity?: Reactivity | null
          moisture_content?: number | null
          particles_over_1mm?: number | null
          particles_under_05mm?: number | null
          particles_009_05mm?: number | null
          granulation?: string | null
          form?: string | null
          is_active?: boolean
          stock_status?: StockStatus
          display_order?: number
          image_url?: string | null
          notes?: string | null
          application_notes?: string | null
          price_per_ton?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: LimeProductType
          cao_content?: number
          mgo_content?: number
          reactivity?: Reactivity | null
          moisture_content?: number | null
          particles_over_1mm?: number | null
          particles_under_05mm?: number | null
          particles_009_05mm?: number | null
          granulation?: string | null
          form?: string | null
          is_active?: boolean
          stock_status?: StockStatus
          display_order?: number
          image_url?: string | null
          notes?: string | null
          application_notes?: string | null
          price_per_ton?: number | null
          created_at?: string
          updated_at?: string
        }
      }

      // ======================================================================
      // LIMING REQUESTS (Poptávky vápnění)
      // ======================================================================
      liming_requests: {
        Row: {
          id: string
          user_id: string
          status: RequestStatus
          total_area: number
          total_quantity: number | null
          delivery_address: string | null
          delivery_date: string | null
          contact_person: string | null
          contact_phone: string | null
          contact_email: string | null
          notes: string | null
          admin_notes: string | null
          quote_amount: number | null
          quote_pdf_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: RequestStatus
          total_area: number
          total_quantity?: number | null
          delivery_address?: string | null
          delivery_date?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          contact_email?: string | null
          notes?: string | null
          admin_notes?: string | null
          quote_amount?: number | null
          quote_pdf_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: RequestStatus
          total_area?: number
          total_quantity?: number | null
          delivery_address?: string | null
          delivery_date?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          contact_email?: string | null
          notes?: string | null
          admin_notes?: string | null
          quote_amount?: number | null
          quote_pdf_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // ======================================================================
      // LIMING REQUEST ITEMS (Položky poptávek)
      // ======================================================================
      liming_request_items: {
        Row: {
          id: string
          request_id: string
          parcel_id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit: string
          notes: string | null
          // Nové: vazba na plán vápnění
          liming_plan_id: string | null
          liming_application_id: string | null
          application_year: number | null
          application_season: 'jaro' | 'leto' | 'podzim' | null
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          parcel_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          unit?: string
          notes?: string | null
          // Nové: vazba na plán vápnění
          liming_plan_id?: string | null
          liming_application_id?: string | null
          application_year?: number | null
          application_season?: 'jaro' | 'leto' | 'podzim' | null
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          parcel_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit?: string
          notes?: string | null
          // Nové: vazba na plán vápnění
          liming_plan_id?: string | null
          liming_application_id?: string | null
          application_year?: number | null
          application_season?: 'jaro' | 'leto' | 'podzim' | null
          created_at?: string
        }
      }

      // ======================================================================
      // PORTAL IMAGES (Obrázky portálu)
      // ======================================================================
      portal_images: {
        Row: {
          id: string
          key: string
          url: string
          alt: string | null
          title: string | null
          description: string | null
          category: string | null
          display_order: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          url: string
          alt?: string | null
          title?: string | null
          description?: string | null
          category?: string | null
          display_order?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          url?: string
          alt?: string | null
          title?: string | null
          description?: string | null
          category?: string | null
          display_order?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      // ======================================================================
      // AUDIT LOGS (Audit záznamy)
      // ======================================================================
      audit_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          table_name: string | null
          record_id: string | null
          old_data: Json | null
          new_data: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          table_name?: string | null
          record_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          table_name?: string | null
          record_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    
    Views: {
      // Database views can be defined here if needed
    }
    
    Functions: {
      // Database functions can be defined here if needed
    }
    
    Enums: {
      user_role: UserRole
      soil_type: SoilType
      culture: Culture
      nutrient_category: NutrientCategory
      ph_category: PhCategory
      request_status: RequestStatus
      lime_type: LimeType
    }
  }
}

// ============================================================================
// HELPER TYPES
// ============================================================================

// Extract Row type from a table
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

// Extract Enum type
export type Enums<T extends keyof Database['public']['Enums']> = 
  Database['public']['Enums'][T]

// Convenient type aliases for common tables
export type Profile = Tables<'profiles'>
export type Parcel = Tables<'parcels'>
export type SoilAnalysis = Tables<'soil_analyses'>
export type FertilizationHistory = Tables<'fertilization_history'>
export type CropRotation = Tables<'crop_rotation'>
export type FertilizationPlan = Tables<'fertilization_plans'>
export type Product = Tables<'products'>
export type LimingRequest = Tables<'liming_requests'>
export type LimingRequestItem = Tables<'liming_request_items'>
export type PortalImage = Tables<'portal_images'>
export type AuditLog = Tables<'audit_logs'>

// Insert types (for creating new records)
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ParcelInsert = Database['public']['Tables']['parcels']['Insert']
export type SoilAnalysisInsert = Database['public']['Tables']['soil_analyses']['Insert']
export type FertilizationHistoryInsert = Database['public']['Tables']['fertilization_history']['Insert']
export type CropRotationInsert = Database['public']['Tables']['crop_rotation']['Insert']
export type FertilizationPlanInsert = Database['public']['Tables']['fertilization_plans']['Insert']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type LimingRequestInsert = Database['public']['Tables']['liming_requests']['Insert']
export type LimingRequestItemInsert = Database['public']['Tables']['liming_request_items']['Insert']
export type PortalImageInsert = Database['public']['Tables']['portal_images']['Insert']
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert']

// Update types (for updating existing records)
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type ParcelUpdate = Database['public']['Tables']['parcels']['Update']
export type SoilAnalysisUpdate = Database['public']['Tables']['soil_analyses']['Update']
export type FertilizationHistoryUpdate = Database['public']['Tables']['fertilization_history']['Update']
export type CropRotationUpdate = Database['public']['Tables']['crop_rotation']['Update']
export type FertilizationPlanUpdate = Database['public']['Tables']['fertilization_plans']['Update']
export type ProductUpdate = Database['public']['Tables']['products']['Update']
export type LimingRequestUpdate = Database['public']['Tables']['liming_requests']['Update']
export type LimingRequestItemUpdate = Database['public']['Tables']['liming_request_items']['Update']
export type PortalImageUpdate = Database['public']['Tables']['portal_images']['Update']
export type AuditLogUpdate = Database['public']['Tables']['audit_logs']['Update']

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Type for parcel with related data
export type ParcelWithAnalysis = Parcel & {
  latest_analysis?: SoilAnalysis | null
  analyses?: SoilAnalysis[]
}

// Type for liming request with items
export type LimingRequestWithItems = LimingRequest & {
  items: (LimingRequestItem & {
    parcel?: Parcel
    product?: Product
  })[]
  user?: Profile
}

// Type for fertilization plan with related data
export type FertilizationPlanWithDetails = FertilizationPlan & {
  parcel?: Parcel
  soil_analysis?: SoilAnalysis
}

// Type for product with category
export type ProductWithCategory = Product & {
  category: 'fertilizer' | 'lime'
}
