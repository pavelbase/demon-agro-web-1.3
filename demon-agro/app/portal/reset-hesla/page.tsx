'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { newPasswordSchema, type NewPasswordFormData } from '@/lib/utils/validations'
import { updatePassword } from '@/lib/actions/auth'
import Image from 'next/image'
import Link from 'next/link'

export default function ResetHeslaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
  })

  // Check if we have a valid token
  useEffect(() => {
    const token = searchParams.get('token')
    const type = searchParams.get('type')
    
    // If no token or wrong type, show error
    if (!token || type !== 'recovery') {
      // Check if this is a password change from settings
      const changePassword = searchParams.get('change_password')
      if (!changePassword) {
        setError('Neplatný nebo chybějící odkaz pro obnovení hesla.')
      }
    }
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
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(result.redirectTo || '/portal/dashboard')
      }, 2000)
    } catch (err) {
      setError('Došlo k neočekávané chybě. Zkuste to prosím znovu.')
    } finally {
      setIsLoading(false)
    }
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
                Vaše heslo bylo změněno. Za chvíli budete přesměrováni...
              </p>
              <Link
                href="/portal/dashboard"
                className="text-primary-green hover:text-primary-brown font-medium"
              >
                Pokračovat do dashboardu →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  {error}
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
                <p className="mt-1 text-xs text-gray-500">
                  Heslo musí mít alespoň 8 znaků
                </p>
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
