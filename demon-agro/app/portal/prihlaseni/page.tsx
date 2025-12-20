'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, resetPasswordSchema, type LoginFormData, type ResetPasswordFormData } from '@/lib/utils/validations'
import { login, requestPasswordReset } from '@/lib/actions/auth'
import Image from 'next/image'
import Link from 'next/link'

export default function PrihlaseniPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  // Check for success messages in URL
  useEffect(() => {
    const message = searchParams.get('message')
    if (message === 'password_changed') {
      setSuccessMessage('Vaše heslo bylo úspěšně změněno. Nyní se můžete přihlásit.')
    }
  }, [searchParams])

  // Login form
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Forgot password form
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await login(data)

      if (!result.success) {
        setError(result.error || 'Přihlášení se nezdařilo')
        return
      }

      // Redirect to appropriate page
      if (result.redirectTo) {
        router.push(result.redirectTo)
      } else {
        router.push('/portal/dashboard')
      }
    } catch (err) {
      setError('Došlo k neočekávané chybě. Zkuste to prosím znovu.')
    } finally {
      setIsLoading(false)
    }
  }

  const onResetSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await requestPasswordReset(data)
      setResetEmailSent(true)
    } catch (err) {
      setError('Došlo k chybě. Zkuste to prosím znovu.')
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
            {showForgotPassword ? 'Obnovení hesla' : 'Přihlášení'}
          </h1>
          <p className="mt-2 text-gray-600">
            {showForgotPassword
              ? 'Zadejte svůj email a my vám pošleme odkaz pro obnovení hesla'
              : 'Přihlaste se do svého účtu'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Show forgot password form */}
          {showForgotPassword ? (
            resetEmailSent ? (
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
                  Email odeslán
                </h3>
                <p className="text-gray-600 mb-6">
                  Pokud účet existuje, poslali jsme vám email s odkazem pro obnovení hesla.
                  Zkontrolujte prosím svou emailovou schránku.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false)
                    setResetEmailSent(false)
                  }}
                  className="text-primary-green hover:text-primary-brown font-medium"
                >
                  ← Zpět na přihlášení
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReset(onResetSubmit)} className="space-y-6">
                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    {...registerReset('email')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    placeholder="vas@email.cz"
                  />
                  {resetErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{resetErrors.email.message}</p>
                  )}
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary-green text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Odesílání...' : 'Odeslat odkaz'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false)
                      setError(null)
                    }}
                    className="w-full text-gray-600 hover:text-gray-800 font-medium"
                  >
                    ← Zpět na přihlášení
                  </button>
                </div>
              </form>
            )
          ) : (
            /* Login form */
            <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-6">
              {/* Success message */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                  <div className="flex">
                    <svg
                      className="h-5 w-5 text-green-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">{successMessage}</span>
                  </div>
                </div>
              )}
              
              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...registerLogin('email')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  placeholder="vas@email.cz"
                  autoComplete="email"
                />
                {loginErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{loginErrors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Heslo
                </label>
                <input
                  id="password"
                  type="password"
                  {...registerLogin('password')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                {loginErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{loginErrors.password.message}</p>
                )}
              </div>

              {/* Forgot password link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true)
                    setError(null)
                  }}
                  className="text-sm text-primary-green hover:text-primary-brown font-medium"
                >
                  Zapomněl jsem heslo
                </button>
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
                    Přihlašování...
                  </span>
                ) : (
                  'Přihlásit se'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer links */}
        {!showForgotPassword && (
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Ještě nemáte účet?{' '}
              <Link
                href="/kontakt"
                className="text-primary-green hover:text-primary-brown font-medium"
              >
                Kontaktujte nás
              </Link>
            </p>
          </div>
        )}

        {/* Back to website */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Zpět na hlavní stránku
          </Link>
        </div>
      </div>
    </div>
  )
}
