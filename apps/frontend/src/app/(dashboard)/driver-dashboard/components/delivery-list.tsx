'use client'

import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'
import { Card, CardContent } from '@/components/ui/card'
import { DeliveryCard } from './delivery-card'
import type { DeliveryWithOrder } from '../hooks/use-driver-dashboard'

interface Props {
  deliveries: DeliveryWithOrder[]
  updating: boolean
  onUpdateStatus: (deliveryId: string, status: string, failureReason?: string) => Promise<void>
}

export function DeliveryList({ deliveries, updating, onUpdateStatus }: Props) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium px-1">{t('my_deliveries')}</p>

      {deliveries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Icon icon="lucide:package" className="h-10 w-10 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">{t('no_results')}</p>
          </CardContent>
        </Card>
      ) : (
        deliveries.map((delivery) => (
          <DeliveryCard
            key={delivery.id}
            delivery={delivery}
            updating={updating}
            onUpdateStatus={onUpdateStatus}
          />
        ))
      )}
    </div>
  )
}
