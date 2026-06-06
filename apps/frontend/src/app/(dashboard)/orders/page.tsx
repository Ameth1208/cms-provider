'use client'

import { useEffect, useState } from 'react'
import { Plus, Package, Clock, Truck, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'
import { useTranslation } from '@/i18n/use-translation'
import { useAuth } from '@/lib/auth-context'
import { useOrders } from './hooks/use-orders'
import { useOrdersStore } from './store/orders-store'
import { OrdersList } from './components/orders-list'
import { OrderDetail } from './components/order-detail'
import { OrderForm } from './components/order-form'

export default function OrdersPage() {
  const { fetchOrders, fetchStats } = useOrders()
  const orders = useOrdersStore((s) => s.orders)
  const stats = useOrdersStore((s) => s.stats)
  const loading = useOrdersStore((s) => s.loading)
  const statusFilter = useOrdersStore((s) => s.statusFilter)
  const setStatusFilter = useOrdersStore((s) => s.setStatusFilter)
  const openCreate = useOrdersStore((s) => s.openCreate)
  const { t } = useTranslation()
  const { user } = useAuth()
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setInitialLoading(true)
      await fetchOrders(statusFilter ? { status: statusFilter } : undefined)
      await fetchStats()
      setInitialLoading(false)
    }
    load()
  }, [fetchOrders, fetchStats, statusFilter])

  const canCreate = user?.permissions.some(
    (p) => p.resource === 'orders' && (p.action === 'create' || p.action === 'manage'),
  )

  const statCards = [
    { label: t('orders_total'), value: stats.totalOrders, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: t('orders_pending'), value: stats.pendingOrders, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { label: t('orders_shipped'), value: stats.shippedOrders, icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
    { label: t('orders_delivered'), value: stats.deliveredOrders, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  ]

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('orders')} description={t('orders_desc')}>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            {t('orders_create')}
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden">
            <div className="absolute right-0 top-0 p-3 opacity-10">
              <stat.icon className={`h-16 w-16 ${stat.color}`} />
            </div>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={statusFilter === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('')}
        >
          {t('all')}
        </Button>
        {[
          { key: 'PENDING', color: 'text-amber-600' },
          { key: 'CONFIRMED', color: 'text-blue-600' },
          { key: 'PROCESSING', color: 'text-purple-600' },
          { key: 'SHIPPED', color: 'text-indigo-600' },
          { key: 'DELIVERED', color: 'text-emerald-600' },
        ].map((s) => (
          <Button
            key={s.key}
            variant={statusFilter === s.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(statusFilter === s.key ? '' : s.key)}
            className={statusFilter === s.key ? '' : s.color}
          >
            {t(`order_status_${s.key.toLowerCase()}`)}
          </Button>
        ))}
        <div className="ml-auto text-sm text-muted-foreground">
          {loading && <Loader2 className="h-3 w-3 animate-spin inline mr-1" />}
          {orders.length} {t('orders_count')}
        </div>
      </div>

      <OrdersList />
      <OrderDetail />
      <OrderForm />
    </div>
  )
}
