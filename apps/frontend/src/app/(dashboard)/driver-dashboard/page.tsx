'use client'

import { Icon } from '@iconify/react'
import { useAuth } from '@/lib/auth-context'
import { useTranslation } from '@/i18n/use-translation'
import { useDriverDashboard } from './hooks/use-driver-dashboard'
import { DriverStats } from './components/driver-stats'
import { DeliveryList } from './components/delivery-list'

export default function DriverDashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const {
    deliveries,
    pendingDeliveries,
    completedToday,
    loading,
    updating,
    updateStatus,
  } = useDriverDashboard()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icon icon="lucide:loader-circle" className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10 max-w-2xl mx-auto">
      <div className="text-center py-6">
        <h1 className="text-2xl font-semibold">{t('driver_dashboard')}</h1>
        <p className="text-muted-foreground">{user?.name || user?.email}</p>
      </div>

      <DriverStats
        pendingCount={pendingDeliveries.length}
        completedCount={completedToday.length}
      />

      <DeliveryList
        deliveries={deliveries}
        updating={updating}
        onUpdateStatus={updateStatus}
      />
    </div>
  )
}
