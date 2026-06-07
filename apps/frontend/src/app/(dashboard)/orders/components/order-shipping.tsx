'use client'

import { useState } from 'react'
import { Truck, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTranslation } from '@/i18n/use-translation'
import { formatPrice } from '@/lib/utils'
import { useOrders } from '../hooks/use-orders'
import type { Order } from '../hooks/use-orders'

interface OrderShippingProps {
  order: Order
}

export function OrderShipping({ order }: OrderShippingProps) {
  const { t } = useTranslation()
  const { updateShippingStatus } = useOrders()
  const [tracking, setTracking] = useState({ carrier: '', number: '' })

  return (
    <div className="space-y-4">
      <section>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('tracking')}</h3>
        {order.trackingNumber ? (
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{order.carrier}</span>
            <span className="text-sm text-muted-foreground">•</span>
            <code className="text-sm font-mono">{order.trackingNumber}</code>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 ml-auto"
              onClick={() => navigator.clipboard.writeText(order.trackingNumber || '')}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder={t('carrier')}
                value={tracking.carrier}
                onChange={(e) => setTracking({ ...tracking, carrier: e.target.value })}
                className="h-8 text-sm"
              />
              <Input
                placeholder={t('tracking_number')}
                value={tracking.number}
                onChange={(e) => setTracking({ ...tracking, number: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
            <Button
              size="sm"
              disabled={!tracking.carrier || !tracking.number}
              onClick={() => updateShippingStatus(order.id, 'SHIPPED', tracking.carrier, tracking.number)}
            >
              {t('save_tracking')}
            </Button>
          </div>
        )}
      </section>

      {order.shippingMethod && (
        <>
          <hr className="border-border" />
          <section>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('shipping_method')}</h3>
            <div className="flex justify-between">
              <span className="text-sm">{order.shippingMethod.name}</span>
              <span className="text-sm font-medium">{formatPrice(order.shippingMethod.price)}</span>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
