'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { newPasswordSchema, type NewPasswordFormData } from '@/lib/utils/validations'
import { updatePassword } from '@/lib/actions/auth'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'

function ResetHeslaContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validatingToken, setValidatingToken] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
  })

  const password = watch('password')

  // Validate token on mount
  useEffect(() => {
    async function validateToken() {
      setValidatingToken(true)
      
      // Check URL parameters
      const token = searchParams.get('token')
      const type = searchParams.get('type')
      
      // Check for Supabase hash in URL (format: #access_token=xxx&type=recovery)
      const hash = window.location.hash
      const hashParams = new URLSearchParams(hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const hashType = hashParams.get('type')
      
      // Check if this is a password change from settings (already logged in)
      const changePassword = searchParams.get('change_password')
      
      if (changePassword) {
        // User is already logged in and wants to change password
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setTokenValid(true)
          setValidatingToken(false)
          return
        }
      }
      
      // Check if we have a recovery token (either from URL params or hash)
      if ((token && type === 'recovery') || (accessToken && hashType === 'recovery')) {
        // Token is present, Supabase will handle validation
        setTokenValid(true)
      } else {
        setError('Neplatný nebo chybějící odkaz pro obnovení hesla. Odkaz mohl vypršet (platnost 60 minut).')
        setTokenValid(false)
      }
      
      setValidatingToken(false)
    }

    validateToken()
  }, [searchParams])

  const onSubmit = async (data: NewPasswordFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await updatePassword(data.password)

      if (!result.success) {
        setError(result.error || 'Nepodařilo se změnit heslo')
        return
      }

      setSuccess(true)
      
      // Redirect to login with success message after 3 seconds
      setTimeout(() => {
        router.push('/portal/prihlaseni?message=password_changed')
      }, 3000)
    } catch (err) {
      setError('Došlo k neočekávané chybě. Zkuste to prosím znovu.')
    } finally {
      setIsLoading(false)
    }
  }

  // Password strength indicator
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: '', color: '' }
    
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++ // Special char (bonus)
    if (pwd.length >= 12) strength++ // Longer password (bonus)
    
    if (strength <= 1) return { strength: 1, label: 'Slabé', color: 'bg-red-500' }
    if (strength === 2) return { strength: 2, label: 'Střední', color: 'bg-yellow-500' }
    if (strength === 3) return { strength: 3, label: 'Dobré', color: 'bg-green-500' }
    return { strength: 4, label: 'Silné', color: 'bg-green-600' }
  }

  const passwordStrength = getPasswordStrength(password)

  // Show loading while validating token
  if (validatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-cream via-white to-primary-cream px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Ověřování odkazu...</p>
        </div>
      </div>
    )
  }

  // Show error if token is invalid
  if (!tokenValid && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-cream via-white to-primary-cream px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <Image
                src="/logo/demon-agro-logo.svg"
                alt="Démon Agro"
                width={180}
                height={60}
                className="mx-auto"
                priority
              />
            </Link>
            <h1 className="mt-6 text-3xl font-bold text-primary-brown">
              Neplatný odkaz
            </h1>
          </div>

          {/* Error Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center py-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Odkaz není platný
              </h3>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <Link
                href="/portal/prihlaseni"
                className="inline-block bg-primary-green text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-brown transition-colors"
              >
                Zpět na přihlášení
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-cream via-white to-primary-cream px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/logo/demon-agro-logo.svg"
              alt="Démon Agro"
              width={180}
              height={60}
              className="mx-auto"
              priority
            />
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-primary-brown">
            {success ? 'Heslo změněno' : 'Nové heslo'}
          </h1>
          <p className="mt-2 text-gray-600">
            {success
              ? 'Vaše heslo bylo úspěšně změněno'
              : 'Zadejte své nové heslo'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {success ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Úspěšně dokončeno!
              </h3>
              <p className="text-gray-600 mb-6">
                Vaše heslo bylo změněno. Za chvíli budete přesměrováni na přihlašovací stránku...
              </p>
              <Link
                href="/portal/prihlaseni"
                className="text-primary-green hover:text-primary-brown font-medium"
              >
                Přihlásit se nyní →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  <div className="flex">
                    <svg
                      className="h-5 w-5 text-red-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* New Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Nové heslo
                </label>
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
                
                {/* Password requirements */}
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-600 font-medium">Požadavky na heslo:</p>
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

                {/* Password strength indicator */}
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Potvrzení hesla
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-green text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Ukládání...
                  </span>
                ) : (
                  'Změnit heslo'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Back to login */}
        {!success && (
          <div className="mt-6 text-center">
            <Link
              href="/portal/prihlaseni"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Zpět na přihlášení
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResetHeslaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-cream via-white to-primary-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
      </div>
    }>
      <ResetHeslaContent />
    </Suspense>
  )
}
