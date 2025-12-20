'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  updatePasswordOnboarding, 
  updateCompanyInfo, 
  completeOnboarding 
} from '@/lib/actions/onboarding'
import { CZECH_DISTRICTS, getDistrictsByRegion } from '@/lib/constants/districts'
import { ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react'
import type { Profile } from '@/lib/types/database'

// Password schema (same as reset password)
const passwordSchema = z.object({
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

// Company info schema
const companySchema = z.object({
  company_name: z.string().min(1, 'Název firmy je povinný'),
  ico: z.string().optional(),
  address: z.string().optional(),
  district: z.string().optional(),
  phone: z.string().optional(),
})

type PasswordFormData = z.infer<typeof passwordSchema>
type CompanyFormData = z.infer<typeof companySchema>

interface OnboardingWizardProps {
  profile: Profile | null
}

export function OnboardingWizard({ profile }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')

  const mustChangePassword = profile?.must_change_password ?? false

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  // Company form
  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      company_name: profile?.company_name ?? '',
      phone: profile?.phone ?? '',
    },
  })

  const password = passwordForm.watch('password')

  // Calculate total steps
  const steps = [
    { id: 0, title: 'Vítejte', required: true },
    ...(mustChangePassword ? [{ id: 1, title: 'Změna hesla', required: true }] : []),
    { id: mustChangePassword ? 2 : 1, title: 'Informace o podniku', required: false },
    { id: mustChangePassword ? 3 : 2, title: 'Hotovo', required: true },
  ]

  const totalSteps = steps.length
  const progress = ((currentStep + 1) / totalSteps) * 100

  // Navigation handlers
  const nextStep = () => {
    setDirection('forward')
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1))
    setError(null)
  }

  const prevStep = () => {
    setDirection('backward')
    setCurrentStep((prev) => Math.max(prev - 1, 0))
    setError(null)
  }

  const skipStep = () => {
    nextStep()
  }

  // Form handlers
  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true)
    setError(null)

    const result = await updatePasswordOnboarding(data.password)

    if (!result.success) {
      setError(result.error || 'Nepodařilo se změnit heslo')
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    nextStep()
  }

  const onCompanySubmit = async (data: CompanyFormData) => {
    setIsLoading(true)
    setError(null)

    const result = await updateCompanyInfo(data)

    if (!result.success) {
      setError(result.error || 'Nepodařilo se uložit informace')
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    nextStep()
  }

  const onComplete = async () => {
    setIsLoading(true)
    await completeOnboarding()
  }

  // Get password strength
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: '', color: '' }
    
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++
    if (pwd.length >= 12) strength++
    
    if (strength <= 1) return { strength: 1, label: 'Slabé', color: 'bg-red-500' }
    if (strength === 2) return { strength: 2, label: 'Střední', color: 'bg-yellow-500' }
    if (strength === 3) return { strength: 3, label: 'Dobré', color: 'bg-green-500' }
    return { strength: 4, label: 'Silné', color: 'bg-green-600' }
  }

  const passwordStrength = getPasswordStrength(password)

  // Group districts by region
  const districtsByRegion = getDistrictsByRegion()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-cream via-white to-primary-cream">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Krok {currentStep + 1} z {totalSteps}
            </span>
            <span className="text-sm text-gray-600">
              {steps[currentStep]?.title}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-green rounded-full h-2 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Step 0: Welcome */}
          {currentStep === 0 && (
            <div className={`bg-white rounded-lg shadow-lg p-8 ${
              direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'
            }`}>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-green bg-opacity-10 rounded-full mb-4">
                  <Sparkles className="h-8 w-8 text-primary-green" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Vítejte v portálu Démon Agro!
                </h1>
                <p className="text-gray-600">
                  Jsme rádi, že jste zde. Než začnete, projdeme společně krátkým nastavením.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-green rounded-full flex items-center justify-center text-white text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Správa pozemků</h3>
                    <p className="text-sm text-gray-600">
                      Přehledná evidence všech vašich pozemků na jednom místě.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-green rounded-full flex items-center justify-center text-white text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Rozbory půdy</h3>
                    <p className="text-sm text-gray-600">
                      Nahrajte PDF rozbory a nechte AI extrahovat data automaticky.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-green rounded-full flex items-center justify-center text-white text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Plány hnojení a vápnění</h3>
                    <p className="text-sm text-gray-600">
                      Generujte plány na základě rozborů a poptávejte produkty.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={nextStep}
                className="w-full bg-primary-green text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-brown transition-colors flex items-center justify-center gap-2"
              >
                Pokračovat
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Step 1: Change Password (if required) */}
          {mustChangePassword && currentStep === 1 && (
            <div className={`bg-white rounded-lg shadow-lg p-8 ${
              direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'
            }`}>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Změňte si heslo
              </h2>
              <p className="text-gray-600 mb-6">
                Z bezpečnostních důvodů je potřeba změnit výchozí heslo.
              </p>

              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nové heslo
                  </label>
                  <input
                    type="password"
                    {...passwordForm.register('password')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    placeholder="••••••••"
                  />
                  {passwordForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordForm.formState.errors.password.message}
                    </p>
                  )}

                  {/* Requirements */}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-600 font-medium">Požadavky:</p>
                    <ul className="text-xs space-y-1">
                      <li className={password?.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                        {password?.length >= 8 ? '✓' : '○'} Minimálně 8 znaků
                      </li>
                      <li className={/[A-Z]/.test(password || '') ? 'text-green-600' : 'text-gray-500'}>
                        {/[A-Z]/.test(password || '') ? '✓' : '○'} Alespoň jedno velké písmeno
                      </li>
                      <li className={/[0-9]/.test(password || '') ? 'text-green-600' : 'text-gray-500'}>
                        {/[0-9]/.test(password || '') ? '✓' : '○'} Alespoň jedno číslo
                      </li>
                    </ul>
                  </div>

                  {/* Strength indicator */}
                  {password && passwordStrength.strength > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-700">Síla hesla:</span>
                        <span className={`text-xs font-medium ${
                          passwordStrength.strength === 1 ? 'text-red-600' :
                          passwordStrength.strength === 2 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Potvrzení hesla
                  </label>
                  <input
                    type="password"
                    {...passwordForm.register('confirmPassword')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    placeholder="••••••••"
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    Zpět
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-primary-green text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? 'Ukládání...' : 'Pokračovat'}
                    {!isLoading && <ChevronRight className="h-5 w-5" />}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 2 (or 1 if no password change): Company Info */}
          {currentStep === (mustChangePassword ? 2 : 1) && (
            <div className={`bg-white rounded-lg shadow-lg p-8 ${
              direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'
            }`}>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Informace o podniku
              </h2>
              <p className="text-gray-600 mb-6">
                Tyto informace nám pomůžou lépe vám sloužit. Můžete je doplnit i později.
              </p>

              <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Název firmy <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...companyForm.register('company_name')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    placeholder="Zemědělské družstvo..."
                  />
                  {companyForm.formState.errors.company_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {companyForm.formState.errors.company_name.message}
                    </p>
                  )}
                </div>

                {/* ICO */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IČO (volitelné)
                  </label>
                  <input
                    type="text"
                    {...companyForm.register('ico')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    placeholder="12345678"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresa (volitelné)
                  </label>
                  <input
                    type="text"
                    {...companyForm.register('address')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    placeholder="Ulice 123, Město"
                  />
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Okres (volitelné)
                  </label>
                  <select
                    {...companyForm.register('district')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  >
                    <option value="">Vyberte okres...</option>
                    {Object.entries(districtsByRegion).map(([region, districts]) => (
                      <optgroup key={region} label={region}>
                        {districts.map((district) => (
                          <option key={district.value} value={district.value}>
                            {district.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Pro stanovení dopravní zóny
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon (volitelné)
                  </label>
                  <input
                    type="tel"
                    {...companyForm.register('phone')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    placeholder="+420 123 456 789"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    Zpět
                  </button>
                  <button
                    type="button"
                    onClick={skipStep}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Přeskočit
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-primary-green text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? 'Ukládání...' : 'Pokračovat'}
                    {!isLoading && <ChevronRight className="h-5 w-5" />}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Final Step: Complete */}
          {currentStep === totalSteps - 1 && (
            <div className={`bg-white rounded-lg shadow-lg p-8 text-center ${
              direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'
            }`}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <Check className="h-8 w-8 text-green-600" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Vše je připraveno!
              </h2>
              <p className="text-gray-600 mb-8">
                Gratulujeme! Váš účet je nyní plně nastaven. Můžete začít používat portál.
              </p>

              <div className="bg-primary-cream border border-primary-green/20 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-3">Co dělat dál?</h3>
                <ul className="text-left space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-green mt-0.5">✓</span>
                    <span>Přidejte své pozemky do evidence</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-green mt-0.5">✓</span>
                    <span>Nahrajte rozbory půdy (PDF)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-green mt-0.5">✓</span>
                    <span>Vygenerujte plány hnojení a vápnění</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-green mt-0.5">✓</span>
                    <span>Vytvořte poptávku na produkty</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="h-5 w-5" />
                  Zpět
                </button>
                <button
                  onClick={onComplete}
                  disabled={isLoading}
                  className="flex-2 bg-primary-green text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Načítání...' : 'Přejít do portálu'}
                  {!isLoading && <ChevronRight className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
