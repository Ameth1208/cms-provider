'use client'

import { useState } from 'react'
import { CreditCard, AlertCircle, Plus, AlertTriangle, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslation } from '@/i18n/use-translation'
import { formatPrice, formatDate } from '@/lib/utils'
import { useOrders } from '../hooks/use-orders'
import type { Order } from '../hooks/use-orders'

const PAYMENT_METHOD_KEYS = ['cash', 'transfer', 'credit_card', 'debit_card', 'mercado_pago', 'other']

interface OrderPaymentsProps {
  order: Order
}

export function OrderPayments({ order }: OrderPaymentsProps) {
  const { t } = useTranslation()
  const { addPayment } = useOrders()
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    method: t('cash'),
    amount: '',
    reference: '',
  })

  const handleAddPayment = async () => {
    if (!paymentForm.amount) return
    try {
      const result = await addPayment(order.id, {
        method: paymentForm.method,
        amount: parseFloat(paymentForm.amount),
        reference: paymentForm.reference || undefined,
      })
      if (result) {
        setShowPaymentForm(false)
        setPaymentForm({ method: t('cash'), amount: '', reference: '' })
      }
    } catch (error) {
      console.error('Error al registrar pago:', error)
      alert(t('error_payment'))
    }
  }

  const totalPaid = order.payments?.reduce((sum, p) => sum + p.amount, 0) || 0
  const pending = Math.max(0, order.total - totalPaid)
  const overpaid = order.overpaidAmount || 0
  const hasOverpaid = overpaid > 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{t('registered_payments')}</h3>
        <Button
          variant="outline"
          size="sm"
          className="h-7"
          onClick={() => setShowPaymentForm(!showPaymentForm)}
        >
          <Plus className="h-3 w-3 mr-1" />
          {showPaymentForm ? t('cancel') : t('add_payment')}
        </Button>
      </div>

      {/* Alerta de saldo a favor */}
      {hasOverpaid && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              {t('customer_overpaid')}
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              {t('overpaid_amount')}: <span className="font-bold">{formatPrice(overpaid)}</span>
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
              {t('overpaid_instruction')}
            </p>
          </div>
        </div>
      )}

      {showPaymentForm && (
        <div className="border border-border rounded-lg p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">{t('method')}</Label>
              <Select
                value={paymentForm.method}
                onValueChange={(value) => setPaymentForm({ ...paymentForm, method: value })}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHOD_KEYS.map((key) => (
                    <SelectItem key={key} value={t(key)} className="text-sm">{t(key)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t('amount')}</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">{t('reference_optional')}</Label>
            <Input
              placeholder={t('reference')}
              value={paymentForm.reference}
              onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
              className="h-8 text-sm"
            />
          </div>
          <Button
            size="sm"
            disabled={!paymentForm.amount}
            onClick={handleAddPayment}
          >
            {t('register_payment')}
          </Button>
        </div>
      )}

      <div className="space-y-2 min-h-[100px]">
        {order.payments && order.payments.length > 0 ? (
          order.payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{p.method}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{formatPrice(p.amount)}</span>
                <Badge variant="secondary" className="text-[10px]">{p.status}</Badge>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">{t('no_payments')}</p>
            <p className="text-xs mt-1">{t('no_payments_desc')}</p>
          </div>
        )}
      </div>

      {order.payments && order.payments.length > 0 && (
        <div className="border-t border-border pt-2 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('total_order')}</span>
            <span className="font-medium">{formatPrice(order.total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('total_paid')}</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatPrice(totalPaid)}</span>
          </div>
          
          {pending > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('pending')}</span>
              <span className="font-medium text-amber-600 dark:text-amber-400">{formatPrice(pending)}</span>
            </div>
          )}
          
          {hasOverpaid && (
            <div className="flex justify-between text-sm bg-emerald-50 dark:bg-emerald-950/20 -mx-2 px-2 py-1 rounded">
              <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <Wallet className="h-3 w-3" />
                {t('balance_in_favor')}
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300">{formatPrice(overpaid)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
