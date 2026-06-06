'use client'

import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  stats: {
    total: number
    pending: number
    inTransit: number
    received: number
    refunded: number
  }
}

export function ReturnsStats({ stats }: Props) {
  const { t } = useTranslation()

  const items = [
    { label: t('returns_title'), value: stats.total, icon: 'lucide:refresh-ccw', color: 'text-primary' },
    { label: t('returns_pending'), value: stats.pending, icon: 'lucide:clock', color: 'text-amber-500' },
    { label: t('returns_in_transit'), value: stats.inTransit, icon: 'lucide:truck', color: 'text-blue-500' },
    { label: t('returns_received'), value: stats.received, icon: 'lucide:package-check', color: 'text-emerald-500' },
    { label: t('returns_refunded_count'), value: stats.refunded, icon: 'lucide:banknote', color: 'text-purple-500' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="py-4 text-center">
            <Icon icon={item.icon} className={`h-6 w-6 mx-auto mb-2 ${item.color}`} />
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
