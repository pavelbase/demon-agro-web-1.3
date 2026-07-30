'use client'

import dynamic from 'next/dynamic'
import type { PlanPredictions } from '@/lib/utils/fertilization-plan'

// Recharts je těžká knihovna - načítá se jen na klientovi, až když je graf skutečně potřeba
const FertilizationPlanChart = dynamic(
  () => import('./FertilizationPlanChart').then((mod) => mod.FertilizationPlanChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 flex items-center justify-center text-sm text-gray-400">
        Načítám graf…
      </div>
    ),
  }
)

interface FertilizationPlanChartLazyProps {
  predictions: PlanPredictions
}

export default function FertilizationPlanChartLazy({ predictions }: FertilizationPlanChartLazyProps) {
  return <FertilizationPlanChart predictions={predictions} />
}
