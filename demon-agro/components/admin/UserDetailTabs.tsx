'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, FlaskConical, Sprout, ShoppingCart, Activity } from 'lucide-react'
import { ParcelsTab } from './tabs/ParcelsTab'
import { AnalysesTab } from './tabs/AnalysesTab'
import { FertilizationPlansTab } from './tabs/FertilizationPlansTab'
import { LimingRequestsTab } from './tabs/LimingRequestsTab'
import { ActivityTab } from './tabs/ActivityTab'

interface UserDetailTabsProps {
  currentTab: string
  parcels: any[]
  analyses: any[]
  limingRequests: any[]
  activityLogs: any[]
}

const TABS = [
  { id: 'pozemky', label: 'Pozemky', icon: MapPin },
  { id: 'rozbory', label: 'Rozbory', icon: FlaskConical },
  { id: 'plany', label: 'Plány hnojení', icon: Sprout },
  { id: 'poptavky', label: 'Poptávky', icon: ShoppingCart },
  { id: 'aktivita', label: 'Aktivita', icon: Activity },
]

export function UserDetailTabs({
  currentTab,
  parcels,
  analyses,
  limingRequests,
  activityLogs,
}: UserDetailTabsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = currentTab === tab.id

            return (
              <Link
                key={tab.id}
                href={`?tab=${tab.id}`}
                className={`
                  flex items-center px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap
                  ${
                    isActive
                      ? 'border-primary-green text-primary-green'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {currentTab === 'pozemky' && <ParcelsTab parcels={parcels} />}
        {currentTab === 'rozbory' && <AnalysesTab analyses={analyses} />}
        {currentTab === 'plany' && <FertilizationPlansTab parcels={parcels} />}
        {currentTab === 'poptavky' && <LimingRequestsTab requests={limingRequests} />}
        {currentTab === 'aktivita' && <ActivityTab logs={activityLogs} />}
      </div>
    </div>
  )
}
