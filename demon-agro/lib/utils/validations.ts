import { z } from 'zod'
import type {
  SoilType,
  Culture,
  NutrientCategory,
  PhCategory,
  RequestStatus,
  LimeType,
} from '../types/database'

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email('Neplatná emailová adresa'),
  password: z.string().min(6, 'Heslo musí mít alespoň 6 znaků'),
})

export const registerSchema = z.object({
  email: z.string().email('Neplatná emailová adresa'),
  password: z.string().min(8, 'Heslo musí mít alespoň 8 znaků'),
  confirmPassword: z.string(),
  fullName: z.string().min(1, 'Jméno je povinné'),
  companyName: z.string().optional(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Hesla se neshodují',
  path: ['confirmPassword'],
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Neplatná emailová adresa'),
})

export const newPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Heslo musí mít alespoň 8 znaků')
    .regex(/[A-Z]/, 'Heslo musí obsahovat alespoň jedno velké písmeno')
    .regex(/[0-9]/, 'Heslo musí obsahovat alespoň jedno číslo'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Hesla se neshodují',
  path: ['confirmPassword'],
})

// ============================================================================
// PARCEL SCHEMAS
// ============================================================================

export const parcelSchema = z.object({
  name: z.string().min(1, 'Název pozemku je povinný'),
  area: z.number().positive('Výměra musí být kladné číslo'),
  cadastralNumber: z.string().optional(),
  soilType: z.enum(['L', 'S', 'T'] as const, {
    required_error: 'Vyberte typ půdy',
    invalid_type_error: 'Neplatný typ půdy',
  }),
  culture: z.enum(['orna', 'ttp'] as const, {
    required_error: 'Vyberte kulturu',
    invalid_type_error: 'Neplatná kultura',
  }),
  notes: z.string().optional(),
})

// ============================================================================
// SOIL ANALYSIS SCHEMAS
// ============================================================================

export const soilAnalysisSchema = z.object({
  parcelId: z.string().uuid('Neplatné ID pozemku'),
  date: z.string().or(z.date()),
  ph: z.number().min(0).max(14, 'pH musí být mezi 0 a 14'),
  phCategory: z.enum(['EK', 'SK', 'N', 'SZ', 'EZ'] as const).optional(),
  phosphorus: z.number().min(0, 'Fosfor musí být kladné číslo'),
  phosphorusCategory: z.enum(['N', 'VH', 'D', 'V', 'VV'] as const).optional(),
  potassium: z.number().min(0, 'Draslík musí být kladné číslo'),
  potassiumCategory: z.enum(['N', 'VH', 'D', 'V', 'VV'] as const).optional(),
  magnesium: z.number().min(0, 'Hořčík musí být kladné číslo'),
  magnesiumCategory: z.enum(['N', 'VH', 'D', 'V', 'VV'] as const).optional(),
  calcium: z.number().min(0).optional(),
  calciumCategory: z.enum(['N', 'VH', 'D', 'V', 'VV'] as const).optional(),
  nitrogen: z.number().min(0).optional(),
  labName: z.string().optional(),
  notes: z.string().optional(),
})

// ============================================================================
// FERTILIZATION SCHEMAS
// ============================================================================

export const fertilizationHistorySchema = z.object({
  parcelId: z.string().uuid('Neplatné ID pozemku'),
  date: z.string().or(z.date()),
  productName: z.string().min(1, 'Název produktu je povinný'),
  quantity: z.number().positive('Množství musí být kladné číslo'),
  unit: z.string().default('kg/ha'),
  nitrogen: z.number().min(0).optional(),
  phosphorus: z.number().min(0).optional(),
  potassium: z.number().min(0).optional(),
  magnesium: z.number().min(0).optional(),
  calcium: z.number().min(0).optional(),
  notes: z.string().optional(),
})

export const fertilizationPlanSchema = z.object({
  parcelId: z.string().uuid('Neplatné ID pozemku'),
  soilAnalysisId: z.string().uuid().optional(),
  year: z.number().int().min(2020).max(2100),
  cropName: z.string().min(1, 'Název plodiny je povinný'),
  expectedYield: z.number().positive().optional(),
  nitrogenNeed: z.number().min(0),
  phosphorusNeed: z.number().min(0),
  potassiumNeed: z.number().min(0),
  magnesiumNeed: z.number().min(0).optional(),
  notes: z.string().optional(),
})

// ============================================================================
// CROP ROTATION SCHEMAS
// ============================================================================

export const cropRotationSchema = z.object({
  parcelId: z.string().uuid('Neplatné ID pozemku'),
  year: z.number().int().min(2020).max(2100),
  cropName: z.string().min(1, 'Název plodiny je povinný'),
  expectedYield: z.number().positive().optional(),
  actualYield: z.number().positive().optional(),
  notes: z.string().optional(),
})

// ============================================================================
// PRODUCT SCHEMAS
// ============================================================================

export const productSchema = z.object({
  name: z.string().min(1, 'Název produktu je povinný'),
  type: z.enum(['fertilizer', 'lime'] as const),
  description: z.string().optional(),
  nitrogen: z.number().min(0).max(100).optional(),
  phosphorus: z.number().min(0).max(100).optional(),
  potassium: z.number().min(0).max(100).optional(),
  magnesium: z.number().min(0).max(100).optional(),
  calcium: z.number().min(0).max(100).optional(),
  cao: z.number().min(0).max(100).optional(),
  mgo: z.number().min(0).max(100).optional(),
  limeType: z.enum(['calcitic', 'dolomite', 'either'] as const).optional(),
  neutralizationValue: z.number().min(0).max(100).optional(),
  price: z.number().min(0).optional(),
  unit: z.string().default('kg'),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().optional(),
})

// ============================================================================
// LIMING REQUEST SCHEMAS
// ============================================================================

export const limingRequestSchema = z.object({
  totalArea: z.number().positive('Celková výměra musí být kladné číslo'),
  deliveryAddress: z.string().optional(),
  deliveryDate: z.string().or(z.date()).optional(),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional(),
  notes: z.string().optional(),
})

export const limingRequestItemSchema = z.object({
  requestId: z.string().uuid('Neplatné ID poptávky'),
  parcelId: z.string().uuid('Neplatné ID pozemku'),
  productId: z.string().uuid().optional(),
  productName: z.string().min(1, 'Název produktu je povinný'),
  quantity: z.number().positive('Množství musí být kladné číslo'),
  unit: z.string().default('t'),
  notes: z.string().optional(),
})

// ============================================================================
// PROFILE SCHEMAS
// ============================================================================

export const profileUpdateSchema = z.object({
  fullName: z.string().min(1, 'Jméno je povinné'),
  companyName: z.string().optional(),
  phone: z.string().optional(),
})

// ============================================================================
// PORTAL IMAGE SCHEMAS
// ============================================================================

export const portalImageSchema = z.object({
  key: z.string().min(1, 'Klíč je povinný'),
  url: z.string().url('Neplatná URL adresa'),
  alt: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().default(true),
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type NewPasswordFormData = z.infer<typeof newPasswordSchema>

export type ParcelFormData = z.infer<typeof parcelSchema>
export type SoilAnalysisFormData = z.infer<typeof soilAnalysisSchema>
export type FertilizationHistoryFormData = z.infer<typeof fertilizationHistorySchema>
export type FertilizationPlanFormData = z.infer<typeof fertilizationPlanSchema>
export type CropRotationFormData = z.infer<typeof cropRotationSchema>

export type ProductFormData = z.infer<typeof productSchema>
export type LimingRequestFormData = z.infer<typeof limingRequestSchema>
export type LimingRequestItemFormData = z.infer<typeof limingRequestItemSchema>

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>
export type PortalImageFormData = z.infer<typeof portalImageSchema>
