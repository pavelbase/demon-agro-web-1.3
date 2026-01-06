import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import ChangePasswordForm from '@/components/ChangePasswordForm'
import UpdateCompanyForm from '@/components/portal/UpdateCompanyForm'

export default async function NastaveniPage() {
  // Ochrana přihlášením - redirect na /portal/prihlaseni pokud není přihlášen
  const user = await requireAuth('/portal/prihlaseni')
  
  // Získání dalších informací o uživateli
  const supabase = await createClient()
  
  // Získání profilu uživatele
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Formátování data vytvoření účtu
  const createdDate = user.created_at 
    ? new Date(user.created_at).toLocaleDateString('cs-CZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Neznámé'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Nadpis stránky */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nastavení účtu</h1>
        <p className="mt-2 text-gray-600">
          Spravujte své osobní údaje a bezpečnostní nastavení
        </p>
      </div>

      <div className="space-y-6">
        {/* Informace o účtu */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Informace o účtu
          </h2>

          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-start border-b border-gray-100 pb-4">
              <div className="flex-shrink-0 w-32">
                <span className="text-sm font-medium text-gray-500">Email</span>
              </div>
              <div className="flex-1">
                <span className="text-sm text-gray-900">{user.email}</span>
                {user.email_confirmed_at && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    <svg
                      className="mr-1 h-3 w-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Ověřeno
                  </span>
                )}
              </div>
            </div>

            {/* Celé jméno */}
            {profile?.full_name && (
              <div className="flex items-start border-b border-gray-100 pb-4">
                <div className="flex-shrink-0 w-32">
                  <span className="text-sm font-medium text-gray-500">Jméno</span>
                </div>
                <div className="flex-1">
                  <span className="text-sm text-gray-900">{profile.full_name}</span>
                </div>
              </div>
            )}

            {/* Telefon */}
            {profile?.phone && (
              <div className="flex items-start border-b border-gray-100 pb-4">
                <div className="flex-shrink-0 w-32">
                  <span className="text-sm font-medium text-gray-500">Telefon</span>
                </div>
                <div className="flex-1">
                  <span className="text-sm text-gray-900">{profile.phone}</span>
                </div>
              </div>
            )}

            {/* Datum vytvoření */}
            <div className="flex items-start border-b border-gray-100 pb-4">
              <div className="flex-shrink-0 w-32">
                <span className="text-sm font-medium text-gray-500">
                  Účet vytvořen
                </span>
              </div>
              <div className="flex-1">
                <span className="text-sm text-gray-900">{createdDate}</span>
              </div>
            </div>

            {/* ID účtu */}
            <div className="flex items-start">
              <div className="flex-shrink-0 w-32">
                <span className="text-sm font-medium text-gray-500">ID účtu</span>
              </div>
              <div className="flex-1">
                <span className="text-xs font-mono text-gray-500">{user.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulář pro úpravu názvu společnosti */}
        <UpdateCompanyForm currentCompanyName={profile?.company_name} />

        {/* Formulář změny hesla */}
        <ChangePasswordForm />

        {/* Dodatečné informace */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800">
                Potřebujete změnit email nebo jméno?
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                Pro změnu emailu nebo jména kontaktujte prosím
                administrátora systému.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
