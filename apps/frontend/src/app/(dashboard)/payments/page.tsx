'use client'

import { useEffect } from 'react'
import { DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'
import { useTranslation } from '@/i18n/use-translation'
import { usePayments } from './hooks/use-payments'
import { PaymentsList } from './components/payments-list'

export default function PaymentsPage() {
  const { fetchPayments, fetchStats, stats } = usePayments()
  const { t } = useTranslation()

  useEffect(() => { 
    fetchPayments()
    fetchStats()
  }, [fetchPayments, fetchStats])

  const statCards = [
    { label: t('payments_total'), value: stats.totalPayments, icon: DollarSign, color: 'text-blue-500' },
    { label: t('payments_paid'), value: `$${stats.totalPaid.toFixed(2)}`, icon: CheckCircle, color: 'text-emerald-500' },
    { label: t('payments_refunded'), value: `$${stats.totalRefunded.toFixed(2)}`, icon: XCircle, color: 'text-red-500' },
    { label: t('payments_pending'), value: stats.totalPending, icon: Clock, color: 'text-amber-500' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title={t('payments_title')} description={t('payments_description')} />

      <div className="grid grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PaymentsList />
    </div>
  )
}
