'use client'

import { useTranslation } from '@/i18n/use-translation'
import { PageHeader } from '@/components/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { useReports } from './hooks/use-reports'
import { LogisticsStats } from './components/logistics-stats'

export default function ReportsPage() {
  const { t } = useTranslation()
  const { deliveryStats, driverStats, returnsStats, loading } = useReports()

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title={t('reports_title')}
        description={t('reports_description')}
      />

      <LogisticsStats
        deliveryStats={deliveryStats}
        driverStats={driverStats}
        returnsStats={returnsStats}
      />
    </div>
  )
}
