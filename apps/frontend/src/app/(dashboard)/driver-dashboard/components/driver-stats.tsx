'use client'

import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  pendingCount: number
  completedCount: number
}

export function DriverStats({ pendingCount, completedCount }: Props) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="py-6 text-center">
          <Icon icon="lucide:package" className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="text-3xl font-bold">{pendingCount}</p>
          <p className="text-sm text-muted-foreground">{t('my_deliveries')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-6 text-center">
          <Icon icon="lucide:check-circle" className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
          <p className="text-3xl font-bold">{completedCount}</p>
          <p className="text-sm text-muted-foreground">{t('delivery_completed')}</p>
        </CardContent>
      </Card>
    </div>
  )
}
