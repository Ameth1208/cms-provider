'use client'

import { useState } from 'react'
import {
  CreditCard,
  CheckCircle,
  DollarSign,
  ArrowLeftRight,
  Package,
  ArrowUpDown,
  Eye,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n/use-translation'
import { formatPrice, formatDate } from '@/lib/utils'
import { usePaymentsStore } from '../store/payments-store'
import { usePayments } from '../hooks/use-payments'
import { PaymentsSkeleton } from './payments-skeleton'

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
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  PAID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  REFUNDED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
  PARTIAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
}

type SortField = 'createdAt' | 'amount' | 'status' | 'method'
type SortOrder = 'asc' | 'desc'

export function PaymentsList() {
  const { t } = useTranslation()
  const { updateStatus } = usePayments()
  const payments = usePaymentsStore((s) => s.payments)
  const loading = usePaymentsStore((s) => s.loading)
  const [statusFilter, setStatusFilter] = useState('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const filtered = statusFilter 
    ? payments.filter((p) => p.status === statusFilter)
    : payments

  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      case 'amount':
        comparison = a.amount - b.amount
        break
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
      case 'method':
        comparison = a.method.localeCompare(b.method)
        break
    }
    return sortOrder === 'asc' ? comparison : -comparison
  })

  if (loading && payments.length === 0) {
    return <PaymentsSkeleton />
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          <div className="space-y-4">
            <DollarSign className="h-12 w-12 mx-auto opacity-20" />
            <p className="text-lg font-medium">{t('payments_no_payments')}</p>
            <p className="text-sm">No hay pagos registrados en el sistema</p>
          </div>
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

      <Card className="overflow-hidden border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('method')}
                  </th>
                  <th 
                    className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      {t('status')}
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('customer')}
                  </th>
                  <th 
                    className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {t('amount')}
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th 
                    className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-1">
                      {t('date')}
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('reference')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sorted.map((payment) => {
                  const MethodIcon = METHOD_ICONS[payment.method] || CreditCard
                  return (
                    <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <MethodIcon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium">
                            {METHOD_LABELS[payment.method] || payment.method}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className={`text-[10px] ${STATUS_COLORS[payment.status]}`}>
                          {STATUS_LABELS[payment.status] || payment.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Package className="h-3 w-3 text-muted-foreground" />
                          <div>
                            <p className="text-sm">{payment.order?.customerName || '-'}</p>
                            <p className="text-xs text-muted-foreground">#{payment.orderId.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-sm font-medium">{formatPrice(payment.amount)}</p>
                        <p className="text-xs text-muted-foreground">{payment.currency}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(payment.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">
                          {payment.reference || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            title={t('view')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {payment.status === 'PENDING' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                              onClick={() => updateStatus(payment.id, 'PAID')}
                              title={t('payments_mark_paid')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
