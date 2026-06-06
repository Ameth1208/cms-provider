'use client'

import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: string | number
  icon: string
  color: string
  sublabel?: string
}

function StatCard({ label, value, icon, color, sublabel }: StatCardProps) {
  return (
    <Card>
      <CardContent className="py-5 px-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
          </div>
          <Icon icon={icon} className={`h-5 w-5 ${color}`} />
        </div>
      </CardContent>
    </Card>
  )
}

interface Props {
  deliveryStats: {
    total: number
    assigned: number
    inProgress: number
    completed: number
    failed: number
    successRate: number
    avgTimeMinutes: number
  } | null
  driverStats: {
    totalDrivers: number
    activeDrivers: number
    totalDeliveries: number
    totalCompleted: number
    totalFailed: number
    avgDeliveryTime: number
    successRate: number
  } | null
  returnsStats: {
    total: number
    pending: number
    inTransit: number
    received: number
    refunded: number
  } | null
}

export function LogisticsStats({ deliveryStats, driverStats, returnsStats }: Props) {
  const { t } = useTranslation()

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins}m`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  return (
    <div className="space-y-6">
      {/* Deliveries */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {t('delivery')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label={t('total')}
            value={deliveryStats?.total ?? 0}
            icon="lucide:package"
            color="text-blue-500"
          />
          <StatCard
            label={t('delivery_completed')}
            value={deliveryStats?.completed ?? 0}
            icon="lucide:check-circle"
            color="text-emerald-500"
            sublabel={`${deliveryStats?.successRate ?? 0}% ${t('success_rate')}`}
          />
          <StatCard
            label={t('delivery_failed')}
            value={deliveryStats?.failed ?? 0}
            icon="lucide:x-circle"
            color="text-red-500"
          />
          <StatCard
            label={t('avg_delivery_time')}
            value={deliveryStats ? formatMinutes(deliveryStats.avgTimeMinutes) : '-'}
            icon="lucide:clock"
            color="text-amber-500"
          />
        </div>
      </div>

      {/* Drivers */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {t('drivers')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label={t('total')}
            value={driverStats?.totalDrivers ?? 0}
            icon="lucide:users"
            color="text-primary"
            sublabel={`${driverStats?.activeDrivers ?? 0} ${t('active')}`}
          />
          <StatCard
            label={t('total_deliveries')}
            value={driverStats?.totalDeliveries ?? 0}
            icon="lucide:truck"
            color="text-indigo-500"
          />
          <StatCard
            label={t('success_rate')}
            value={`${driverStats?.successRate ?? 0}%`}
            icon="lucide:trending-up"
            color="text-emerald-500"
          />
          <StatCard
            label={t('avg_delivery_time')}
            value={driverStats ? formatMinutes(driverStats.avgDeliveryTime) : '-'}
            icon="lucide:timer"
            color="text-purple-500"
          />
        </div>
      </div>

      {/* Returns */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {t('returns')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            label={t('total')}
            value={returnsStats?.total ?? 0}
            icon="lucide:refresh-ccw"
            color="text-primary"
          />
          <StatCard
            label={t('returns_pending')}
            value={returnsStats?.pending ?? 0}
            icon="lucide:clock"
            color="text-amber-500"
          />
          <StatCard
            label={t('returns_in_transit')}
            value={returnsStats?.inTransit ?? 0}
            icon="lucide:truck"
            color="text-blue-500"
          />
          <StatCard
            label={t('returns_received')}
            value={returnsStats?.received ?? 0}
            icon="lucide:package-check"
            color="text-emerald-500"
          />
          <StatCard
            label={t('returns_refunded_count')}
            value={returnsStats?.refunded ?? 0}
            icon="lucide:banknote"
            color="text-purple-500"
          />
        </div>
      </div>
    </div>
  )
}
