'use client'

import { useState } from 'react'
import { AlertTriangle, XCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useTranslation } from '@/i18n/use-translation'
import { formatPrice } from '@/lib/utils'
import { useOrders } from '../hooks/use-orders'
import type { Order } from '../hooks/use-orders'

interface OrderCancelDialogProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderCancelDialog({ order, open, onOpenChange }: OrderCancelDialogProps) {
  const { t } = useTranslation()
  const { cancelOrder } = useOrders()
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  // Calculate refund preview
  const totalPaid = order.payments?.reduce((sum, p) => sum + (p.status === 'PAID' ? p.amount : 0), 0) || 0
  
  let refundAmount = 0
  const notShipped = ['PENDING', 'READY'].includes(order.shippingStatus)
  const shipped = ['SHIPPED', 'IN_TRANSIT'].includes(order.shippingStatus)
  
  if (notShipped) {
    refundAmount = Math.min(totalPaid, order.total)
  } else if (shipped) {
    refundAmount = Math.min(totalPaid, order.subtotal + order.tax - order.discount)
  }
  
  const keepShipping = shipped && refundAmount < totalPaid

  const handleCancel = async () => {
    setLoading(true)
    try {
      await cancelOrder(order.id, { reason })
      onOpenChange(false)
    } catch (error) {
      console.error('Error cancelling order:', error)
      alert(t('error_cancelling'))
    } finally {
      setLoading(false)
    }
  }

  const isCancelled = order.status === 'CANCELLED'
  const isDelivered = order.status === 'DELIVERED'
  const canCancel = !isCancelled && !isDelivered

  if (!canCancel) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t('cancel_order')}
          </DialogTitle>
          <DialogDescription>
            {t('cancel_order_desc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Order summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">{t('order_summary')}</p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('total_order')}</span>
              <span>{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('total_paid')}</span>
              <span className="text-emerald-600 dark:text-emerald-400">{formatPrice(totalPaid)}</span>
            </div>
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-destructive">{t('amount_to_refund')}</span>
                <span className="text-destructive">{formatPrice(refundAmount)}</span>
              </div>
              {keepShipping && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t('shipping_not_refunded')}: {formatPrice(order.shippingCost)}
                </p>
              )}
            </div>
          </div>

          {/* Status warning */}
          {shipped && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {t('order_already_shipped_warning')}
              </p>
            </div>
          )}

          {/* Reason input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('cancellation_reason')}</label>
            <Textarea
              placeholder={t('cancellation_reason_placeholder')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('keep_order')}
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleCancel} 
            disabled={loading}
            className="gap-2"
          >
            <XCircle className="h-4 w-4" />
            {loading ? t('cancelling') + '...' : t('confirm_cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
