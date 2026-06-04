'use client'

import { useEffect, useState } from 'react'
import { Plus, Package, Clock, Truck, CheckCircle, LayoutGrid, List, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'
import { useTranslation } from '@/i18n/use-translation'
import { useAuth } from '@/lib/auth-context'
import { useOrders } from './hooks/use-orders'
import { OrdersTable } from './components/orders-table'
import { OrdersCardView } from './components/orders-card-view'
import { OrdersKanbanView } from './components/orders-kanban-view'
import { OrderDetailDialog } from './components/order-detail-dialog'
import { OrderCreateDialog } from './components/order-create-dialog'

export default function OrdersPage() {
  const { fetchOrders, fetchStats, stats, orders } = useOrders()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [createOpen, setCreateOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'kanban'>('cards')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => { 
    fetchOrders(statusFilter ? { status: statusFilter } : undefined)
    fetchStats()
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

  const handleSelectOrder = (order: any) => {
    setSelectedOrder(order)
    setDetailOpen(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('orders')} description={t('orders_desc')}>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode('cards')}
              title="Vista de tarjetas"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode('kanban')}
              title="Vista Kanban"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode('table')}
              title="Vista de tabla"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          {canCreate && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('orders_create')}
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden">
            <div className={`absolute right-0 top-0 p-3 opacity-10`}>
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={statusFilter === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('')}
        >
          {t('all')}
        </Button>
        {[
          { key: 'PENDING', label: t('order_status_pending'), color: 'text-amber-600' },
          { key: 'CONFIRMED', label: t('order_status_confirmed'), color: 'text-blue-600' },
          { key: 'PROCESSING', label: t('order_status_processing'), color: 'text-purple-600' },
          { key: 'SHIPPED', label: t('order_status_shipped'), color: 'text-indigo-600' },
          { key: 'DELIVERED', label: t('order_status_delivered'), color: 'text-emerald-600' },
        ].map((status) => (
          <Button
            key={status.key}
            variant={statusFilter === status.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(statusFilter === status.key ? '' : status.key)}
            className={statusFilter === status.key ? '' : status.color}
          >
            {status.label}
          </Button>
        ))}
        <div className="ml-auto text-sm text-muted-foreground">
          {orders.length} {t('orders_count')}
        </div>
      </div>

      {/* Content */}
      {viewMode === 'cards' && <OrdersCardView onSelect={handleSelectOrder} />}
      {viewMode === 'kanban' && <OrdersKanbanView onSelect={handleSelectOrder} />}
      {viewMode === 'table' && <OrdersTable />}

      {/* Dialogs */}
      <OrderDetailDialog
        order={selectedOrder}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <OrderCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
