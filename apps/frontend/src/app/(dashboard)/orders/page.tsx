'use client'

import { useEffect, useState } from 'react'
import { Plus, Package, Clock, Truck, CheckCircle, Search, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/page-header'
import { useTranslation } from '@/i18n/use-translation'
import { useAuth } from '@/lib/auth-context'
import { useOrders } from './hooks/use-orders'
import { useOrdersStore } from './store/orders-store'
import { OrdersList } from './components/orders-list'
import { OrdersSkeleton } from './components/orders-skeleton'
import { OrderDetail } from './components/order-detail'
import { OrderForm } from './components/order-form'

export default function OrdersPage() {
  const { fetchOrders, fetchStats } = useOrders()
  const orders = useOrdersStore((s) => s.orders)
  const stats = useOrdersStore((s) => s.stats)
  const loading = useOrdersStore((s) => s.loading)
  const statusFilter = useOrdersStore((s) => s.statusFilter)
  const setStatusFilter = useOrdersStore((s) => s.setStatusFilter)
  const searchQuery = useOrdersStore((s) => s.searchQuery)
  const setSearchQuery = useOrdersStore((s) => s.setSearchQuery)
  const dateFilter = useOrdersStore((s) => s.dateFilter)
  const setDateFilter = useOrdersStore((s) => s.setDateFilter)
  const page = useOrdersStore((s) => s.page)
  const setPage = useOrdersStore((s) => s.setPage)
  const pageSize = useOrdersStore((s) => s.pageSize)
  const totalOrders = useOrdersStore((s) => s.totalOrders)
  const openCreate = useOrdersStore((s) => s.openCreate)
  const { t } = useTranslation()
  const { user } = useAuth()
  const [initialLoading, setInitialLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(searchQuery)

  const totalPages = Math.ceil(totalOrders / pageSize)

  useEffect(() => {
    const load = async () => {
      setInitialLoading(true)
      const filters: any = {}
      if (statusFilter && statusFilter !== 'all') filters.status = statusFilter
      if (searchQuery) filters.search = searchQuery
      if (dateFilter && dateFilter !== 'all') {
        const today = new Date()
        if (dateFilter === 'today') {
          filters.from = today.toISOString().split('T')[0]
          filters.to = today.toISOString().split('T')[0]
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          filters.from = weekAgo.toISOString().split('T')[0]
          filters.to = today.toISOString().split('T')[0]
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          filters.from = monthAgo.toISOString().split('T')[0]
          filters.to = today.toISOString().split('T')[0]
        }
      }
      filters.page = page
      filters.pageSize = pageSize
      await fetchOrders(filters)
      await fetchStats()
      setInitialLoading(false)
    }
    load()
  }, [fetchOrders, fetchStats, statusFilter, searchQuery, dateFilter, page, pageSize])

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
    return <OrdersSkeleton />
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
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search_orders') || 'Buscar pedidos...'}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSearchQuery(searchInput)
              }
            }}
            className="pl-10 pr-10 h-9"
          />
          {searchInput && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSearchInput('')
                setSearchQuery('')
              }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] h-9 text-sm">
            <SelectValue placeholder={t('all_statuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_statuses')}</SelectItem>
            {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((status) => (
              <SelectItem key={status} value={status}>
                {t(`order_status_${status.toLowerCase()}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[160px] h-9 text-sm">
            <SelectValue placeholder={t('all_dates')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_dates')}</SelectItem>
            <SelectItem value="today">{t('today')}</SelectItem>
            <SelectItem value="week">{t('last_week')}</SelectItem>
            <SelectItem value="month">{t('last_month')}</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto text-sm text-muted-foreground">
          {loading && <Loader2 className="h-3 w-3 animate-spin inline mr-1" />}
          {t('orders_count', { count: orders.length, total: totalOrders })}
        </div>
      </div>

      <OrdersList />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="text-sm text-muted-foreground">
            {t('page_of', { page, total: totalPages })}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={page === p ? 'default' : 'outline'}
                size="sm"
                className="w-8"
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <OrderDetail />
      <OrderForm />
    </div>
  )
}
