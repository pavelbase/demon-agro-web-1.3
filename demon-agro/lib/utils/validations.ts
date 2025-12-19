import { z } from 'zod'

// Validační schémata pro formuláře

export const loginSchema = z.object({
  email: z.string().email('Neplatná emailová adresa'),
  password: z.string().min(6, 'Heslo musí mít alespoň 6 znaků'),
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Neplatná emailová adresa'),
})

export const fieldSchema = z.object({
  name: z.string().min(1, 'Název pozemku je povinný'),
  area: z.number().positive('Výměra musí být kladné číslo'),
  cadastralNumber: z.string().optional(),
  soilType: z.enum(['light', 'medium', 'heavy']),
})

export const soilAnalysisSchema = z.object({
  fieldId: z.string().uuid(),
  date: z.string().or(z.date()),
  ph: z.number().min(0).max(14),
  phosphorus: z.number().min(0),
  potassium: z.number().min(0),
  magnesium: z.number().min(0),
  nitrogen: z.number().min(0).optional(),
})

export const limingRequestSchema = z.object({
  fieldId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().positive('Množství musí být kladné číslo'),
  notes: z.string().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type FieldFormData = z.infer<typeof fieldSchema>
export type SoilAnalysisFormData = z.infer<typeof soilAnalysisSchema>
export type LimingRequestFormData = z.infer<typeof limingRequestSchema>
