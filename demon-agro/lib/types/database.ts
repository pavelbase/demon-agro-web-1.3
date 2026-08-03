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
export type Culture = 'orna' | 'ttp' | 'chmelnice' // Orná půda, Travní trvalý porost, Chmelnice
export type NutrientCategory = 'nizky' | 'vyhovujici' | 'dobry' | 'vysoky' | 'velmi_vysoky' // Nízký, Vyhovující, Dobrý, Vysoký, Velmi Vysoký
export type PhCategory = 'extremne_kysela' | 'silne_kysela' | 'slabe_kysela' | 'neutralni' | 'slabe_alkalicka' | 'alkalicka' // Extrémně kyselá, Silně kyselá, Slabě kyselá, Neutrální, Slabě alkalická, Alkalická
export type RequestStatus = 'new' | 'in_progress' | 'quoted' | 'completed' | 'cancelled'
export type LimeType = 'calcitic' | 'dolomite' | 'either' // Vápenatý, Dolomitový, Libovolný
export type LimeProductType = 'calcitic' | 'dolomite' | 'both' // Pro liming_products tabulku
export type Reactivity = 'low' | 'medium' | 'high' | 'very_high'
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order'

// Evidence použití hnojiv a POR
export type ApplicationItemKind = 'hnojivo' | 'por' | 'pomocna'
export type ApplicationMode = 'skutecnost' | 'plan'
export type ApplicationCheckStatus = 'unchecked' | 'ok' | 'info' | 'warning' | 'error'
/** Kde záznam vznikl – 'pole' je rychlý zápis z provozu */
export type ApplicationSource = 'manual' | 'import' | 'pole'
/** Zápis z pole se do evidenční knihy počítá až po schválení */
export type ApplicationRecordStatus = 'ceka' | 'schvaleno'

// Akční program nitrátové směrnice – skupiny hnojiv podle uvolnitelnosti dusíku
export type NitrogenGroup = 'mineralni' | 'rychle' | 'pomalu' | 'bez_dusiku'
export type NitrogenFertilizerGroup = Exclude<NitrogenGroup, 'bez_dusiku'>

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
      // AGRO CUSTOMERS (AgroManažer - Kalkulačka zákazníků)
      // ======================================================================
      agro_customers: {
        Row: {
          id: string
          user_id: string
          jmeno: string
          vymera_ha: number
          davka_kg_ha: number
          cena_nakup_material_tuna: number
          cena_prodej_sluzba_ha: number
          cena_najem_traktor_mth: number
          vykonnost_ha_mth: number
          cena_nafta_tuna_materialu: number
          cena_traktorista_mth: number
          cena_traktorista_tuna: number
          traktorista_typ: 'hodina' | 'tuna'
          pozadovany_zisk_ha: number
          pocet_kamionu: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          jmeno?: string
          vymera_ha?: number
          davka_kg_ha?: number
          cena_nakup_material_tuna?: number
          cena_prodej_sluzba_ha?: number
          cena_najem_traktor_mth?: number
          vykonnost_ha_mth?: number
          cena_nafta_tuna_materialu?: number
          cena_traktorista_mth?: number
          cena_traktorista_tuna?: number
          traktorista_typ?: 'hodina' | 'tuna'
          pozadovany_zisk_ha?: number
          pocet_kamionu?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          jmeno?: string
          vymera_ha?: number
          davka_kg_ha?: number
          cena_nakup_material_tuna?: number
          cena_prodej_sluzba_ha?: number
          cena_najem_traktor_mth?: number
          vykonnost_ha_mth?: number
          cena_nafta_tuna_materialu?: number
          cena_traktorista_mth?: number
          cena_traktorista_tuna?: number
          traktorista_typ?: 'hodina' | 'tuna'
          pozadovany_zisk_ha?: number
          pocet_kamionu?: number | null
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
          // NULL po smazání uživatele – záznam v auditu zůstává
          user_id: string | null
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

      // ======================================================================
      // POR – REGISTR PŘÍPRAVKŮ NA OCHRANU ROSTLIN (ÚKZÚZ)
      // ======================================================================
      // Referenční data importovaná z oficiálního exportu registru ÚKZÚZ
      // (scripts/import-por-registry.ts). Aplikace je pouze čte.
      // ======================================================================

      // Přípravky – agregace na "Id položky" z registru
      por_products: {
        Row: {
          item_id: number
          name: string
          main_product_item_id: number | null
          main_product_name: string | null
          registration_number: string | null
          all_registration_numbers: string[] | null
          authorization_holder: string | null
          biological_function: string | null
          all_biological_functions: string[] | null
          registration_status: string | null
          decision_status: string | null
          product_regime: string | null
          package_type: string | null
          organic_farming: boolean | null
          seed_treatment: boolean | null
          renewal_in_progress: boolean | null
          valid_from: string | null
          valid_until: string | null
          market_until: string | null
          use_until: string | null
          trade_name_until: string | null
          parallel_import: boolean
          is_authorized: boolean
          is_discontinued: boolean
          decisions_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          item_id: number
          name: string
          main_product_item_id?: number | null
          main_product_name?: string | null
          registration_number?: string | null
          all_registration_numbers?: string[] | null
          authorization_holder?: string | null
          biological_function?: string | null
          all_biological_functions?: string[] | null
          registration_status?: string | null
          decision_status?: string | null
          product_regime?: string | null
          package_type?: string | null
          organic_farming?: boolean | null
          seed_treatment?: boolean | null
          renewal_in_progress?: boolean | null
          valid_from?: string | null
          valid_until?: string | null
          market_until?: string | null
          use_until?: string | null
          trade_name_until?: string | null
          parallel_import?: boolean
          is_authorized?: boolean
          is_discontinued?: boolean
          decisions_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['por_products']['Insert']>
      }

      // Rozhodnutí o povolení přípravku (historie registrace)
      por_decisions: {
        Row: {
          id: number
          product_item_id: number
          decision_id: number
          registration_number: string | null
          authorization_holder: string | null
          valid_from: string | null
          valid_until: string | null
          market_until: string | null
          use_until: string | null
          trade_name_until: string | null
          biological_function: string | null
          registration_status: string | null
          decision_status: string | null
          product_regime: string | null
          package_type: string | null
          organic_farming: boolean | null
          seed_treatment: boolean | null
          renewal_in_progress: boolean | null
          main_product_item_id: number | null
          main_product_name: string | null
          sp_record_number: string | null
          reference_product_name: string | null
          eea_product_name: string | null
          eea_country: string | null
          import_permit_holder: string | null
          import_purpose: string | null
          created_at: string
        }
        Insert: {
          id?: number
          product_item_id: number
          decision_id: number
          registration_number?: string | null
          authorization_holder?: string | null
          valid_from?: string | null
          valid_until?: string | null
          market_until?: string | null
          use_until?: string | null
          trade_name_until?: string | null
          biological_function?: string | null
          registration_status?: string | null
          decision_status?: string | null
          product_regime?: string | null
          package_type?: string | null
          organic_farming?: boolean | null
          seed_treatment?: boolean | null
          renewal_in_progress?: boolean | null
          main_product_item_id?: number | null
          main_product_name?: string | null
          sp_record_number?: string | null
          reference_product_name?: string | null
          eea_product_name?: string | null
          eea_country?: string | null
          import_permit_holder?: string | null
          import_purpose?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['por_decisions']['Insert']>
      }

      // Účinné látky přípravku
      por_active_substances: {
        Row: {
          id: number
          product_item_id: number
          decision_id: number | null
          registration_number: string | null
          substance_record_id: number | null
          name_cs: string
          name_en: string | null
          amount: number | null
          amount_text: string | null
          unit: string | null
          substance_groups: string | null
          created_at: string
        }
        Insert: {
          id?: number
          product_item_id: number
          decision_id?: number | null
          registration_number?: string | null
          substance_record_id?: number | null
          name_cs: string
          name_en?: string | null
          amount?: number | null
          amount_text?: string | null
          unit?: string | null
          substance_groups?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['por_active_substances']['Insert']>
      }

      // Povolená použití: plodina + škodlivý organismus + dávka + ochranná lhůta
      por_usages: {
        Row: {
          id: number
          product_item_id: number
          decision_id: number | null
          registration_number: string | null
          crop: string | null
          pest: string | null
          dose_text: string | null
          protection_period_text: string | null
          protection_period_days: number | null
          aerial_application: boolean | null
          application_notes: string | null
          seed_treatment: boolean | null
          created_at: string
        }
        Insert: {
          id?: number
          product_item_id: number
          decision_id?: number | null
          registration_number?: string | null
          crop?: string | null
          pest?: string | null
          dose_text?: string | null
          protection_period_text?: string | null
          protection_period_days?: number | null
          aerial_application?: boolean | null
          application_notes?: string | null
          seed_treatment?: boolean | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['por_usages']['Insert']>
      }

      // Strukturované dávkování vč. dávky vody
      por_dosages: {
        Row: {
          id: number
          product_item_id: number
          decision_id: number | null
          registration_number: string | null
          crop: string | null
          pest: string | null
          dose_text: string | null
          dose_min: number | null
          dose_max: number | null
          unit: string | null
          water_min: number | null
          water_max: number | null
          water_unit: string | null
          dose_note: string | null
          dose_full_text: string | null
          created_at: string
        }
        Insert: {
          id?: number
          product_item_id: number
          decision_id?: number | null
          registration_number?: string | null
          crop?: string | null
          pest?: string | null
          dose_text?: string | null
          dose_min?: number | null
          dose_max?: number | null
          unit?: string | null
          water_min?: number | null
          water_max?: number | null
          water_unit?: string | null
          dose_note?: string | null
          dose_full_text?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['por_dosages']['Insert']>
      }

      // Hodnocené údaje: klasifikace CLP, H-věty, rizika, ochranná pásma vod
      por_product_attributes: {
        Row: {
          id: number
          product_item_id: number
          decision_id: number | null
          registration_number: string | null
          attribute: string
          abbreviation: string | null
          meaning: string | null
          note: string | null
          created_at: string
        }
        Insert: {
          id?: number
          product_item_id: number
          decision_id?: number | null
          registration_number?: string | null
          attribute: string
          abbreviation?: string | null
          meaning?: string | null
          note?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['por_product_attributes']['Insert']>
      }

      // Vazba na číselník plodin ÚKZÚZ
      por_crops: {
        Row: {
          id: number
          product_item_id: number
          decision_id: number | null
          registration_number: string | null
          crop_code: string | null
          crop_name: string | null
          crop_type: string | null
          is_match: boolean | null
          web_listing: string | null
          created_at: string
        }
        Insert: {
          id?: number
          product_item_id: number
          decision_id?: number | null
          registration_number?: string | null
          crop_code?: string | null
          crop_name?: string | null
          crop_type?: string | null
          is_match?: boolean | null
          web_listing?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['por_crops']['Insert']>
      }

      // Vazba na kódovaný seznam škodlivých organismů (PPP)
      por_pests: {
        Row: {
          id: number
          product_item_id: number
          decision_id: number | null
          registration_number: string | null
          pest_name: string | null
          ppp_code: string | null
          created_at: string
        }
        Insert: {
          id?: number
          product_item_id: number
          decision_id?: number | null
          registration_number?: string | null
          pest_name?: string | null
          ppp_code?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['por_pests']['Insert']>
      }

      // ======================================================================
      // REGISTR HNOJIV (ÚKZÚZ)
      // ======================================================================
      // Hnojiva, substráty, biostimulanty a pomocné látky. Jeden řádek =
      // jeden registrační záznam; obnovy registrace téhož hnojiva mají shodné
      // registration_number a odlišuje je is_latest.
      // (scripts/import-fertilizer-registry.ts)
      // ======================================================================
      fert_products: {
        Row: {
          evidence_number: string
          registration_number: string | null
          name: string
          regime: string | null
          product_type: string | null
          product_kind: string | null
          nitrogen_category: string | null
          organic_farming: boolean | null
          applicant: string | null
          manufacturer: string | null
          valid_from: string | null
          valid_until: string | null
          is_valid: boolean
          is_latest: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          evidence_number: string
          registration_number?: string | null
          name: string
          regime?: string | null
          product_type?: string | null
          product_kind?: string | null
          nitrogen_category?: string | null
          organic_farming?: boolean | null
          applicant?: string | null
          manufacturer?: string | null
          valid_from?: string | null
          valid_until?: string | null
          is_valid?: boolean
          is_latest?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['fert_products']['Insert']>
      }

      // ==================================================================
      // ČÍSELNÍK HNOJIV – OBSAHY ŽIVIN
      // ==================================================================
      // Registr ÚKZÚZ obsah živin neuvádí, evidence hnojení ho potřebuje.
      // Kromě registrovaných hnojiv drží číselník i normativy statkových
      // hnojiv a rostlinných zbytků (bez evidenčního čísla).
      // (lib/supabase/sql/create_fert_nutrients_table.sql)
      // ==================================================================
      fert_nutrients: {
        Row: {
          catalog_id: number
          evidence_number: string | null
          registration_number: string | null
          name: string
          name_key: string
          catalog_type: string | null
          nitrogen_category: string | null
          product_kind: string | null
          unit_type: 'H' | 'O' | null
          is_normative: boolean
          is_excrement: boolean
          is_organic: boolean
          valid_from: string | null
          valid_until: string | null
          n_percent: number | null
          p2o5_percent: number | null
          k2o_percent: number | null
          cao_percent: number | null
          mgo_percent: number | null
          na2o_percent: number | null
          s_percent: number | null
          cl_percent: number | null
          zn_percent: number | null
          cu_percent: number | null
          fe_percent: number | null
          b_percent: number | null
          mn_percent: number | null
          mo_percent: number | null
          se_percent: number | null
          combustible_matter_percent: number | null
          trace_elements: string | null
          density_kg_l: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['fert_nutrients']['Row'],
          'created_at' | 'updated_at'
        > &
          Partial<Pick<Database['public']['Tables']['fert_nutrients']['Row'], 'created_at' | 'updated_at'>>
        Update: Partial<Database['public']['Tables']['fert_nutrients']['Insert']>
      }

      // Log importů registru hnojiv
      fert_imports: {
        Row: {
          id: number
          source_file: string
          exported_on: string | null
          row_counts: Json
          imported_at: string
        }
        Insert: {
          id?: number
          source_file: string
          exported_on?: string | null
          row_counts?: Json
          imported_at?: string
        }
        Update: Partial<Database['public']['Tables']['fert_imports']['Insert']>
      }

      // ==================================================================
      // DÍLY PŮDNÍCH BLOKŮ (DPB) – evidence pro službu Hnojiva a POR
      // ==================================================================
      // Vlastní data uživatele importovaná ze sestavy "Informativní údaje
      // o DPB" (LPIS). Záměrně oddělené od tabulky `parcels`, která slouží
      // vápnění – DPB nese legislativní atributy rozhodující o aplikaci
      // hnojiv a POR (ZOD, aplikační pásmo, erozní ohroženost…).
      // (lib/supabase/sql/create_land_blocks_table.sql)
      // ==================================================================
      land_blocks: {
        Row: {
          id: string
          user_id: string
          square_code: string
          dpb_code: string
          cadastral_area: string | null
          area: number
          area_without_features: number | null
          perimeter_m: number | null
          culture: string | null
          farming_mode: string | null
          organic_conversion_from: string | null
          organic_from: string | null
          nitrate_vulnerable_zone: boolean | null
          application_zone: string | null
          erosion_class: string | null
          soil_kind: string | null
          soil_type: SoilType | null
          slope_degrees: number | null
          water_distance_m: number | null
          drainage: boolean | null
          // Zařazení podle BPEJ pro akční program nitrátové směrnice; LPIS ho
          // v sestavě neuvádí, doplňuje se u DPB
          climatic_region: number | null
          yield_level: number | null
          bpej_code: string | null
          lfa_type: string | null
          lfa_area_text: string | null
          protected_area_type: string | null
          protected_area_ha: number | null
          buffer_zone_ha: number | null
          ect_ha: number | null
          aeko_als: string | null
          notes: string | null
          source_file: string | null
          imported_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          square_code: string
          dpb_code: string
          cadastral_area?: string | null
          area: number
          area_without_features?: number | null
          perimeter_m?: number | null
          culture?: string | null
          farming_mode?: string | null
          organic_conversion_from?: string | null
          organic_from?: string | null
          nitrate_vulnerable_zone?: boolean | null
          application_zone?: string | null
          erosion_class?: string | null
          soil_kind?: string | null
          soil_type?: SoilType | null
          slope_degrees?: number | null
          water_distance_m?: number | null
          drainage?: boolean | null
          climatic_region?: number | null
          yield_level?: number | null
          bpej_code?: string | null
          lfa_type?: string | null
          lfa_area_text?: string | null
          protected_area_type?: string | null
          protected_area_ha?: number | null
          buffer_zone_ha?: number | null
          ect_ha?: number | null
          aeko_als?: string | null
          notes?: string | null
          source_file?: string | null
          imported_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['land_blocks']['Insert']>
      }

      // Log importů DPB jednotlivých uživatelů
      land_block_imports: {
        Row: {
          id: string
          user_id: string
          source_file: string
          rows_total: number
          rows_created: number
          rows_updated: number
          imported_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source_file: string
          rows_total?: number
          rows_created?: number
          rows_updated?: number
          imported_at?: string
        }
        Update: Partial<Database['public']['Tables']['land_block_imports']['Insert']>
      }

      // ==================================================================
      // EVIDENCE POUŽITÍ HNOJIV A POR
      // ==================================================================
      // land_blocks (DPB) → crop_parcels (parcela) → parcel_crops (osev)
      //   → applications (aplikace) → application_items (položky)
      // (lib/supabase/sql/create_application_records_tables.sql)
      // ==================================================================

      // Číselník plodin s aliasy pro párování na názvy plodin v registru POR
      crops: {
        Row: {
          id: number
          code: string
          name: string
          category: string | null
          season: 'ozima' | 'jarni' | null
          registry_aliases: string[]
          // Limit přívodu N podle přílohy 3 NV 262/2012 (nitrate_crop_limits)
          nitrate_limit_key: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          code: string
          name: string
          category?: string | null
          season?: 'ozima' | 'jarni' | null
          registry_aliases?: string[]
          nitrate_limit_key?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['crops']['Insert']>
      }

      // Skladové karty produktů – u hnojiv nesou obsah živin, který registr neuvádí
      product_cards: {
        Row: {
          id: string
          user_id: string
          kind: ApplicationItemKind
          name: string
          por_item_id: number | null
          fert_evidence_number: string | null
          default_unit: string | null
          n_percent: number | null
          p2o5_percent: number | null
          k2o_percent: number | null
          dry_matter_percent: number | null
          density_kg_l: number | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          kind: ApplicationItemKind
          name: string
          por_item_id?: number | null
          fert_evidence_number?: string | null
          default_unit?: string | null
          n_percent?: number | null
          p2o5_percent?: number | null
          k2o_percent?: number | null
          dry_matter_percent?: number | null
          density_kg_l?: number | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['product_cards']['Insert']>
      }

      // Evidenční parcela (parcela/objekt v EPH) ležící v dílu půdního bloku
      crop_parcels: {
        Row: {
          id: string
          user_id: string
          land_block_id: string | null
          block_code: string | null
          name: string
          area: number
          notes: string | null
          status: 'active' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          land_block_id?: string | null
          block_code?: string | null
          name: string
          area: number
          notes?: string | null
          status?: 'active' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['crop_parcels']['Insert']>
      }

      // Osev parcely v sezóně – termín setí a sklizně je vstupem kontrol
      parcel_crops: {
        Row: {
          id: string
          user_id: string
          crop_parcel_id: string
          crop_id: number | null
          crop_name: string
          season: number
          sowing_date: string | null
          harvest_date: string | null
          variety: string | null
          area: number | null
          yield_t_ha: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          crop_parcel_id: string
          crop_id?: number | null
          crop_name: string
          season: number
          sowing_date?: string | null
          harvest_date?: string | null
          variety?: string | null
          area?: number | null
          yield_t_ha?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['parcel_crops']['Insert']>
      }

      // Aplikace – jeden záznam evidenční knihy k datu a parcele
      applications: {
        Row: {
          id: string
          user_id: string
          crop_parcel_id: string
          parcel_crop_id: string | null
          application_date: string
          applied_area: number
          mode: ApplicationMode
          method: string | null
          is_tankmix: boolean
          notes: string | null
          source: ApplicationSource
          record_status: ApplicationRecordStatus
          submitted_at: string | null
          approved_at: string | null
          check_status: ApplicationCheckStatus
          check_findings: Json
          checked_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          crop_parcel_id: string
          parcel_crop_id?: string | null
          application_date: string
          applied_area: number
          mode?: ApplicationMode
          method?: string | null
          is_tankmix?: boolean
          notes?: string | null
          source?: ApplicationSource
          record_status?: ApplicationRecordStatus
          submitted_at?: string | null
          approved_at?: string | null
          check_status?: ApplicationCheckStatus
          check_findings?: Json
          checked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['applications']['Insert']>
      }

      // Položky aplikace – hnojiva, přípravky a pomocné látky
      application_items: {
        Row: {
          id: string
          user_id: string
          application_id: string
          kind: ApplicationItemKind
          product_name: string
          product_card_id: string | null
          por_item_id: number | null
          fert_evidence_number: string | null
          dose: number
          unit: string
          total_amount: number | null
          target_pest: string | null
          n_kg_ha: number | null
          p2o5_kg_ha: number | null
          k2o_kg_ha: number | null
          // Zařazení hnojiva pro akční program – převzaté z číselníku hnojiv
          nitrogen_group: NitrogenGroup | null
          is_livestock_manure: boolean
          /** Přívod živin je odhad – u objemové dávky chyběla měrná hmotnost */
          n_estimated: boolean
          batch: string | null
          warehouse: string | null
          notes: string | null
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          application_id: string
          kind: ApplicationItemKind
          product_name: string
          product_card_id?: string | null
          por_item_id?: number | null
          fert_evidence_number?: string | null
          dose: number
          unit: string
          total_amount?: number | null
          target_pest?: string | null
          n_kg_ha?: number | null
          p2o5_kg_ha?: number | null
          k2o_kg_ha?: number | null
          nitrogen_group?: NitrogenGroup | null
          is_livestock_manure?: boolean
          n_estimated?: boolean
          batch?: string | null
          warehouse?: string | null
          notes?: string | null
          position?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['application_items']['Insert']>
      }

      // Log importů evidence aplikací
      application_imports: {
        Row: {
          id: string
          user_id: string
          source_file: string
          counts: Json
          imported_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source_file: string
          counts?: Json
          imported_at?: string
        }
        Update: Partial<Database['public']['Tables']['application_imports']['Insert']>
      }

      // ==================================================================
      // AKČNÍ PROGRAM NITRÁTOVÉ SMĚRNICE
      // ==================================================================
      // Přílohy č. 2 a 3 NV 262/2012 Sb. ve znění NV 193/2024 Sb.
      // Společné číselníky – čtení všem přihlášeným, zápis adminovi.
      // (lib/supabase/sql/create_nitrate_directive_tables.sql)
      // ==================================================================

      // Období zákazu hnojení podle klimatického regionu a skupiny hnojiva
      nitrate_ban_periods: {
        Row: {
          id: number
          climatic_region_from: number
          climatic_region_to: number
          fertilizer_group: NitrogenFertilizerGroup
          variant: 'zakladni' | 'sklon_do_5_s_porostem' | 'letni_bez_nasledne_plodiny'
          ban_from_month: number
          ban_from_day: number
          ban_to_month: number
          ban_to_day: number
          is_conditional: boolean
          note: string | null
        }
        Insert: Database['public']['Tables']['nitrate_ban_periods']['Row']
        Update: Partial<Database['public']['Tables']['nitrate_ban_periods']['Insert']>
      }

      // Zařazení BPEJ do výnosové hladiny, aplikačního pásma a rizika infiltrace
      nitrate_bpej_rules: {
        Row: {
          id: number
          rule_kind: 'vynosova_hladina' | 'aplikacni_pasmo' | 'riziko_infiltrace'
          result: string
          row_number: number | null
          climatic_regions: number[]
          hpj_codes: number[]
          detail_codes: string[] | null
          slope_condition: 'do_7' | 'nad_7' | null
          note: string | null
        }
        Insert: Database['public']['Tables']['nitrate_bpej_rules']['Row']
        Update: Partial<Database['public']['Tables']['nitrate_bpej_rules']['Insert']>
      }

      // Způsoby hnojení po sklizni jednoletých hlavních plodin
      nitrate_post_harvest_methods: {
        Row: {
          method_number: number
          label: string
          note: string | null
        }
        Insert: Database['public']['Tables']['nitrate_post_harvest_methods']['Row']
        Update: Partial<Database['public']['Tables']['nitrate_post_harvest_methods']['Insert']>
      }

      // Maximální dávky N po sklizni podle aplikačního pásma
      nitrate_post_harvest_limits: {
        Row: {
          id: number
          method_number: number
          application_zone: 'I.' | 'II.' | 'III.'
          infiltration_risk: 'stredni' | 'vysoke' | null
          fertilizer_group: 'mineralni' | 'rychle'
          limit_kg_n_ha: number
          note: string | null
        }
        Insert: Database['public']['Tables']['nitrate_post_harvest_limits']['Row']
        Update: Partial<Database['public']['Tables']['nitrate_post_harvest_limits']['Insert']>
      }

      // Limity přívodu dusíku k plodině (podle výnosové hladiny nebo pevné)
      nitrate_crop_limits: {
        Row: {
          crop_key: string
          crop_label: string
          source_table: 'p3_t4' | 'p3_t5' | 'p3_t6'
          yield_unit: string | null
          level1_yield: number | null
          level1_limit_kg_n_ha: number | null
          level2_yield_from: number | null
          level2_yield_to: number | null
          level2_limit_kg_n_ha: number | null
          level3_yield_over: number | null
          level3_limit_kg_n_ha: number | null
          flat_limit_kg_n_ha: number | null
          per_calendar_year: boolean
          note: string | null
        }
        Insert: Omit<
          Database['public']['Tables']['nitrate_crop_limits']['Row'],
          'per_calendar_year'
        > &
          Partial<Pick<Database['public']['Tables']['nitrate_crop_limits']['Row'], 'per_calendar_year'>>
        Update: Partial<Database['public']['Tables']['nitrate_crop_limits']['Insert']>
      }

      // Log importů registru POR – verze zdrojového souboru a počty řádků
      por_imports: {
        Row: {
          id: number
          source_file: string
          exported_on: string | null
          row_counts: Json
          imported_at: string
        }
        Insert: {
          id?: number
          source_file: string
          exported_on?: string | null
          row_counts?: Json
          imported_at?: string
        }
        Update: Partial<Database['public']['Tables']['por_imports']['Insert']>
      }
    }
    
    Views: {
      // Database views can be defined here if needed
    }
    
    Functions: {
      // Vyhledávání přípravků POR (viz migrace add_por_search_function)
      search_por_products: {
        Args: {
          p_query?: string | null
          p_function?: string | null
          p_crop?: string | null
          p_only_authorized?: boolean
          p_organic_only?: boolean
          p_limit?: number
          p_offset?: number
        }
        Returns: PorProductSearchResult[]
      }

      // Vyhledávání hnojiv (viz migrace add_fert_search_function)
      search_fert_products: {
        Args: {
          p_query?: string | null
          p_kind?: string | null
          p_nitrogen_category?: string | null
          p_regime?: string | null
          p_only_valid?: boolean
          p_only_latest?: boolean
          p_organic_only?: boolean
          p_limit?: number
          p_offset?: number
        }
        Returns: FertProductSearchResult[]
      }
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
export type LimingProduct = Tables<'liming_products'>
export type LimingRequest = Tables<'liming_requests'>
export type LimingRequestItem = Tables<'liming_request_items'>
export type PortalImage = Tables<'portal_images'>
export type AgroCustomer = Tables<'agro_customers'>
export type AuditLog = Tables<'audit_logs'>

// Registr POR (ÚKZÚZ)
export type PorProduct = Tables<'por_products'>
export type PorDecision = Tables<'por_decisions'>
export type PorActiveSubstance = Tables<'por_active_substances'>
export type PorUsage = Tables<'por_usages'>
export type PorDosage = Tables<'por_dosages'>
export type PorProductAttribute = Tables<'por_product_attributes'>
export type PorCrop = Tables<'por_crops'>
export type PorPest = Tables<'por_pests'>
export type PorImport = Tables<'por_imports'>

// Registr hnojiv (ÚKZÚZ)
export type FertProduct = Tables<'fert_products'>
export type FertNutrient = Tables<'fert_nutrients'>
export type FertImport = Tables<'fert_imports'>

// Díly půdních bloků (LPIS) pro službu Hnojiva a POR
export type LandBlock = Tables<'land_blocks'>
export type LandBlockInsert = Database['public']['Tables']['land_blocks']['Insert']
export type LandBlockUpdate = Database['public']['Tables']['land_blocks']['Update']
export type LandBlockImport = Tables<'land_block_imports'>

// Evidence použití hnojiv a POR
export type Crop = Tables<'crops'>
export type ProductCard = Tables<'product_cards'>
export type ProductCardInsert = Database['public']['Tables']['product_cards']['Insert']
export type CropParcel = Tables<'crop_parcels'>
export type CropParcelInsert = Database['public']['Tables']['crop_parcels']['Insert']
export type ParcelCrop = Tables<'parcel_crops'>
export type ParcelCropInsert = Database['public']['Tables']['parcel_crops']['Insert']
export type Application = Tables<'applications'>
export type ApplicationInsert = Database['public']['Tables']['applications']['Insert']
export type ApplicationItem = Tables<'application_items'>
export type ApplicationItemInsert = Database['public']['Tables']['application_items']['Insert']

// Akční program nitrátové směrnice (NV 262/2012)
export type NitrateBanPeriod = Tables<'nitrate_ban_periods'>
export type NitratePostHarvestMethod = Tables<'nitrate_post_harvest_methods'>
export type NitratePostHarvestLimit = Tables<'nitrate_post_harvest_limits'>
export type NitrateCropLimit = Tables<'nitrate_crop_limits'>
export type NitrateBpejRule = Tables<'nitrate_bpej_rules'>

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
export type AgroCustomerInsert = Database['public']['Tables']['agro_customers']['Insert']
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
export type AgroCustomerUpdate = Database['public']['Tables']['agro_customers']['Update']
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

// ============================================================================
// REGISTR POR – UTILITY TYPY
// ============================================================================

/** Řádek výsledku funkce search_por_products (total_count = počet všech shod) */
export interface PorProductSearchResult {
  item_id: number
  name: string
  registration_number: string | null
  biological_function: string | null
  authorization_holder: string | null
  use_until: string | null
  is_authorized: boolean
  organic_farming: boolean | null
  seed_treatment: boolean | null
  parallel_import: boolean
  active_substances: string | null
  usages_count: number
  total_count: number
}

/** Přípravek se všemi navazujícími údaji z registru (detail přípravku) */
export type PorProductWithDetails = PorProduct & {
  active_substances?: PorActiveSubstance[]
  usages?: PorUsage[]
  dosages?: PorDosage[]
  attributes?: PorProductAttribute[]
  decisions?: PorDecision[]
  crops?: PorCrop[]
  pests?: PorPest[]
}

/** Filtry vyhledávání přípravků */
export interface PorSearchFilters {
  query?: string
  biologicalFunction?: string
  crop?: string
  onlyAuthorized?: boolean
  organicOnly?: boolean
  page?: number
}

// ============================================================================
// REGISTR HNOJIV – UTILITY TYPY
// ============================================================================

/** Řádek výsledku funkce search_fert_products (total_count = počet všech shod) */
export interface FertProductSearchResult {
  evidence_number: string
  registration_number: string | null
  name: string
  regime: string | null
  product_type: string | null
  product_kind: string | null
  nitrogen_category: string | null
  organic_farming: boolean | null
  applicant: string | null
  manufacturer: string | null
  valid_from: string | null
  valid_until: string | null
  is_valid: boolean
  is_latest: boolean
  /** Počet záznamů se stejným registračním číslem (obnovy registrace) */
  versions_count: number
  total_count: number
}

/** Hnojivo s historií registrace téhož registračního čísla (detail hnojiva) */
export type FertProductWithHistory = FertProduct & {
  history?: FertProduct[]
}

/** Filtry vyhledávání hnojiv */
export interface FertSearchFilters {
  query?: string
  productKind?: string
  nitrogenCategory?: string
  regime?: string
  onlyValid?: boolean
  onlyLatest?: boolean
  organicOnly?: boolean
  page?: number
}

// ============================================================================
// DÍLY PŮDNÍCH BLOKŮ – UTILITY TYPY
// ============================================================================

/** Souhrn evidence DPB pro přehled nad seznamem */
export interface LandBlockSummary {
  count: number
  totalArea: number
  nvzCount: number
  nvzArea: number
  erosionCount: number
  culturesByArea: { culture: string; area: number; count: number }[]
  lastImportedAt: string | null
  lastSourceFile: string | null
}

/** Výsledek importu sestavy Informativní údaje o DPB */
export interface LandBlockImportResult {
  success: boolean
  error?: string
  created?: number
  updated?: number
  skipped?: number
}

// ============================================================================
// EVIDENCE APLIKACÍ – UTILITY TYPY
// ============================================================================

/** Aplikace se vším, co přehled i detail potřebují zobrazit */
export type ApplicationWithDetails = Application & {
  items: ApplicationItem[]
  parcel: Pick<CropParcel, 'id' | 'name' | 'area' | 'block_code' | 'land_block_id'> | null
  parcel_crop: Pick<ParcelCrop, 'id' | 'crop_name' | 'season' | 'sowing_date' | 'harvest_date'> | null
}

/** Souhrn evidence pro přehled nad seznamem */
export interface ApplicationsSummary {
  count: number
  seasonCount: number
  errorCount: number
  warningCount: number
  uncheckedCount: number
  porItemCount: number
  fertilizerItemCount: number
  treatedArea: number
}

/** Osev s parcelou a napojeným DPB – kontext pro kontroly a formulář */
export type ParcelCropWithContext = ParcelCrop & {
  parcel: CropParcel & { land_block: LandBlock | null }
}
