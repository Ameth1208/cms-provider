'use client'

import { useState } from 'react'
import {
  CreditCard,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  ArrowLeftRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n/use-translation'
import { usePayments } from '../hooks/use-payments'

const METHOD_ICONS: Record<string, any> = {
  CREDIT_CARD: CreditCard,
  DEBIT_CARD: CreditCard,
  CASH: DollarSign,
  BANK_TRANSFER: ArrowLeftRight,
  MERCADOPAGO: CreditCard,
  STRIPE: CreditCard,
  PAYPAL: CreditCard,
}

const METHOD_LABELS: Record<string, string> = {
  CREDIT_CARD: 'Tarjeta de crédito',
  DEBIT_CARD: 'Tarjeta de débito',
  CASH: 'Efectivo',
  BANK_TRANSFER: 'Transferencia',
  MERCADOPAGO: 'MercadoPago',
  STRIPE: 'Stripe',
  PAYPAL: 'PayPal',
  OTHER: 'Otro',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  FAILED: 'Fallido',
  REFUNDED: 'Reembolsado',
  PARTIAL: 'Parcial',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-700',
  PARTIAL: 'bg-blue-100 text-blue-700',
}

export function PaymentsList() {
  const { t } = useTranslation()
  const { payments, loading, updateStatus } = usePayments()
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = statusFilter 
    ? payments.filter((p) => p.status === statusFilter)
    : payments

  if (loading && payments.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          {t('loading')}
        </CardContent>
      </Card>
    )
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          {t('payments_no_payments')}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['', 'PENDING', 'PAID', 'FAILED', 'REFUNDED'].map((status) => (
          <Button
            key={status || 'all'}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status ? STATUS_LABELS[status] : t('all')}
          </Button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y">
            {filtered.map((payment) => {
              const MethodIcon = METHOD_ICONS[payment.method] || CreditCard
              return (
                <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MethodIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{METHOD_LABELS[payment.method] || payment.method}</span>
                        <Badge variant="secondary" className={`text-[10px] ${STATUS_COLORS[payment.status]}`}>
                          {STATUS_LABELS[payment.status] || payment.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('payments_order')}: #{payment.orderId.slice(0, 8)} · {payment.order?.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold">${payment.amount.toFixed(2)} {payment.currency}</p>
                      <p className="text-xs text-muted-foreground">{t('payments_reference')}: {payment.reference || 'N/A'}</p>
                    </div>

                    {payment.status === 'PENDING' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(payment.id, 'PAID')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t('payments_mark_paid')}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
