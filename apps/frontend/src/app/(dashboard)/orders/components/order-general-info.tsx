'use client'

import { useState } from 'react'
import { User, MapPin, Edit3, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTranslation } from '@/i18n/use-translation'
import { formatPrice } from '@/lib/utils'
import { useOrders } from '../hooks/use-orders'
import type { Order } from '../hooks/use-orders'

interface OrderGeneralInfoProps {
  order: Order
}

export function OrderGeneralInfo({ order }: OrderGeneralInfoProps) {
  const { t } = useTranslation()
  const { updateOrder } = useOrders()
  const [editingAddress, setEditingAddress] = useState(false)
  const [addressForm, setAddressForm] = useState({
    shippingAddress: order.shippingAddress || '',
    shippingCity: order.shippingCity || '',
    shippingState: order.shippingState || '',
    shippingZip: order.shippingZip || '',
    shippingCountry: order.shippingCountry || '',
  })

  const handleUpdateAddress = async () => {
    await updateOrder(order.id, addressForm)
    setEditingAddress(false)
  }

  return (
    <div className="space-y-4">
      <section>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('customer')}</h3>
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{order.customerName}</p>
            <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
            {order.customerPhone && <p className="text-sm text-muted-foreground">{order.customerPhone}</p>}
          </div>
        </div>
      </section>

      <hr className="border-border" />

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">{t('address')}</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => {
              setAddressForm({
                shippingAddress: order.shippingAddress || '',
                shippingCity: order.shippingCity || '',
                shippingState: order.shippingState || '',
                shippingZip: order.shippingZip || '',
                shippingCountry: order.shippingCountry || '',
              })
              setEditingAddress(!editingAddress)
            }}
          >
            <Edit3 className="h-3 w-3 mr-1" />
            {editingAddress ? t('cancel') : t('edit')}
          </Button>
        </div>
        
        {editingAddress ? (
          <div className="space-y-2">
            <Input
              placeholder={t('address')}
              value={addressForm.shippingAddress}
              onChange={(e) => setAddressForm({ ...addressForm, shippingAddress: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder={t('city')}
                value={addressForm.shippingCity}
                onChange={(e) => setAddressForm({ ...addressForm, shippingCity: e.target.value })}
              />
              <Input
                placeholder={t('state')}
                value={addressForm.shippingState}
                onChange={(e) => setAddressForm({ ...addressForm, shippingState: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder={t('zip')}
                value={addressForm.shippingZip}
                onChange={(e) => setAddressForm({ ...addressForm, shippingZip: e.target.value })}
              />
              <Input
                placeholder={t('country')}
                value={addressForm.shippingCountry}
                onChange={(e) => setAddressForm({ ...addressForm, shippingCountry: e.target.value })}
              />
            </div>
            <Button size="sm" onClick={handleUpdateAddress}>
              <Check className="h-3 w-3 mr-1" />
              {t('save')}
            </Button>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm">{order.shippingAddress || '-'}</p>
              <p className="text-sm text-muted-foreground">
                {order.shippingCity}{order.shippingCity && order.shippingState ? ', ' : ''}{order.shippingState} {order.shippingZip}
              </p>
              <p className="text-sm text-muted-foreground">{order.shippingCountry}</p>
            </div>
          </div>
        )}
      </section>

      <hr className="border-border" />

      <section>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('summary')}</h3>
        <div className="space-y-1">
          {[
            { k: 'subtotal', v: order.subtotal },
            { k: 'discount', v: order.discount, neg: true },
            { k: 'tax', v: order.tax },
            { k: 'shipping', v: order.shippingCost },
          ].map((r) =>
            r.v > 0 || r.k === 'subtotal' ? (
              <div key={r.k} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t(r.k)}</span>
                <span className={r.neg ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                  {r.neg ? '-' : ''}{formatPrice(r.v)}
                </span>
              </div>
            ) : null
          )}
          <div className="flex justify-between font-bold pt-2 border-t border-border mt-2">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </section>

      {(order.notes || order.internalNotes) && (
        <>
          <hr className="border-border" />
          <section>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('notes')}</h3>
            {order.notes && <p className="text-sm text-muted-foreground">{order.notes}</p>}
            {order.internalNotes && <p className="text-sm text-muted-foreground">{order.internalNotes}</p>}
          </section>
        </>
      )}
    </div>
  )
}
