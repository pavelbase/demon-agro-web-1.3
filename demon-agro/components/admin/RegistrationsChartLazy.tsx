'use client'

import dynamic from 'next/dynamic'

// Recharts je těžká knihovna - načítá se jen na klientovi, až když je graf skutečně potřeba
const RegistrationsChart = dynamic(
  () => import('./RegistrationsChart').then((mod) => mod.RegistrationsChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 flex items-center justify-center text-sm text-gray-400">
        Načítám graf…
      </div>
    ),
  }
)

interface Registration {
  created_at: string
}

interface RegistrationsChartLazyProps {
  data: Registration[]
}

export default function RegistrationsChartLazy({ data }: RegistrationsChartLazyProps) {
  return <RegistrationsChart data={data} />
}
