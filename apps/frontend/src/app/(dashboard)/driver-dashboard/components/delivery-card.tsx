'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import type { DeliveryWithOrder } from '../hooks/use-driver-dashboard'

interface Props {
  delivery: DeliveryWithOrder
  updating: boolean
  onUpdateStatus: (deliveryId: string, status: string, failureReason?: string) => Promise<void>
}

export function DeliveryCard({ delivery, updating, onUpdateStatus }: Props) {
  const { t } = useTranslation()
  const [showFailureReason, setShowFailureReason] = useState(false)
  const [failureReason, setFailureReason] = useState('')

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ASSIGNED: 'bg-blue-100 text-blue-700',
      IN_PROGRESS: 'bg-amber-100 text-amber-700',
      NEARBY: 'bg-purple-100 text-purple-700',
      COMPLETED: 'bg-emerald-100 text-emerald-700',
      FAILED: 'bg-red-100 text-red-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ASSIGNED: t('delivery_assigned'),
      IN_PROGRESS: t('delivery_in_progress'),
      NEARBY: t('delivery_nearby'),
      COMPLETED: t('delivery_completed'),
      FAILED: t('delivery_failed'),
    }
    return labels[status] || status
  }

  const handleFail = async () => {
    await onUpdateStatus(delivery.id, 'FAILED', failureReason || undefined)
    setShowFailureReason(false)
    setFailureReason('')
  }

  return (
    <Card className={delivery.status === 'COMPLETED' ? 'opacity-60' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-medium">{delivery.order.customerName}</p>
            <p className="text-sm text-muted-foreground">
              {delivery.order.shippingAddress}
              {delivery.order.shippingCity && `, ${delivery.order.shippingCity}`}
            </p>
          </div>
          <Badge className={getStatusColor(delivery.status)}>
            {getStatusLabel(delivery.status)}
          </Badge>
        </div>

        <div className="space-y-1 mb-4">
          {delivery.order.items.map((item, i) => (
            <p key={i} className="text-sm text-muted-foreground">
              {item.quantity}x {item.catalogItemName}
            </p>
          ))}
        </div>

        {showFailureReason && (
          <div className="space-y-2 mb-4">
            <Textarea
              placeholder={t('failure_reason_placeholder')}
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowFailureReason(false)}
              >
                {t('cancel')}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleFail}
                disabled={updating}
              >
                {t('confirm')}
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="font-medium">{formatPrice(delivery.order.total)}</p>

          {delivery.status === 'ASSIGNED' && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus(delivery.id, 'IN_PROGRESS')}
              disabled={updating}
            >
              <Icon icon="lucide:play" className="h-4 w-4 mr-1" />
              {t('delivery_start')}
            </Button>
          )}

          {delivery.status === 'IN_PROGRESS' && !showFailureReason && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowFailureReason(true)}
                disabled={updating}
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <Icon icon="lucide:x" className="h-4 w-4 mr-1" />
                {t('delivery_failed')}
              </Button>
              <Button
                size="sm"
                onClick={() => onUpdateStatus(delivery.id, 'COMPLETED')}
                disabled={updating}
              >
                <Icon icon="lucide:check" className="h-4 w-4 mr-1" />
                {t('delivery_complete')}
              </Button>
            </div>
          )}

          {delivery.status === 'COMPLETED' && (
            <span className="text-sm text-emerald-600 font-medium">✓ {t('delivery_completed')}</span>
          )}

          {delivery.status === 'FAILED' && (
            <span className="text-sm text-destructive font-medium">✗ {t('delivery_failed')}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
