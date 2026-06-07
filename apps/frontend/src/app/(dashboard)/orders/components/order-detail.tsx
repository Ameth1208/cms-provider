'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslation } from '@/i18n/use-translation'
import { formatPrice, formatDate } from '@/lib/utils'
import { useOrdersStore } from '../store/orders-store'
import { useOrders } from '../hooks/use-orders'
import { OrderGeneralInfo } from './order-general-info'
import { OrderItems } from './order-items'
import { OrderShipping } from './order-shipping'
import { OrderPayments } from './order-payments'
import { OrderCancelDialog } from './order-cancel-dialog'

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  PENDING: { color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  CONFIRMED: { color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  PROCESSING: { color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  SHIPPED: { color: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  DELIVERED: { color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  CANCELLED: { color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/30' },
}

const PAYMENT_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  PAID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  PARTIAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  REFUNDED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
}

export function OrderDetail() {
  const { t } = useTranslation()
  const detailOpen = useOrdersStore((s) => s.detailOpen)
  const closeDetail = useOrdersStore((s) => s.closeDetail)
  const selectedId = useOrdersStore((s) => s.selectedOrderId)
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === selectedId))
  const { updateStatus } = useOrders()
  const [activeTab, setActiveTab] = useState<'general' | 'items' | 'shipping' | 'payments'>('general')
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  if (!order) return null

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING

  const tabs = [
    { key: 'general' as const, label: t('tab_general') },
    { key: 'items' as const, label: t('tab_products_count', { count: order.items.length }) },
    { key: 'shipping' as const, label: t('tab_shipping') },
    { key: 'payments' as const, label: t('tab_payments_count', { count: order.payments?.length || 0 }) },
  ]

  return (
    <Dialog open={detailOpen} onOpenChange={closeDetail}>
      <DialogContent className="max-w-4xl max-h-[95vh] p-0 flex flex-col">
        {/* Header */}
        <div className="px-6 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold">{formatPrice(order.total)}</span>
                <Badge className={`text-[10px] ${PAYMENT_COLORS[order.paymentStatus] || ''}`}>
                  {t(`payment_status_${order.paymentStatus.toLowerCase()}`)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-mono">#{order.id.slice(-6).toUpperCase()}</span>
                <span>•</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                <button
                  onClick={() => setCancelDialogOpen(true)}
                  className="text-xs text-destructive hover:text-destructive/80 px-2 py-1 rounded hover:bg-destructive/10 transition-colors"
                >
                  {t('cancel_order')}
                </button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${statusConfig.bg} ${statusConfig.color} hover:opacity-80 transition-opacity`}>
                    <span className="h-2 w-2 rounded-full bg-current" />
                    {t(`order_status_${order.status.toLowerCase()}`)}
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {Object.keys(STATUS_CONFIG).map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => updateStatus(order.id, status)}
                      className="text-sm cursor-pointer"
                    >
                      <span className={`h-2 w-2 rounded-full mr-2 ${STATUS_CONFIG[status].bg}`} />
                      {t(`order_status_${status.toLowerCase()}`)}
                      {order.status === status && <span className="ml-auto text-xs">✓</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Tabs - Mobile only */}
        <div className="px-6 border-b border-border bg-muted/30 md:hidden">
          <div className="flex gap-6 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          
          {/* Desktop: 2 columnas */}
          <div className="hidden md:grid md:grid-cols-2 md:gap-6">
            <div className="space-y-6">
              <OrderGeneralInfo order={order} />
              <OrderPayments order={order} />
            </div>
            <div className="space-y-6">
              <OrderItems order={order} />
              <OrderShipping order={order} />
            </div>
          </div>

          {/* Mobile: Tabs */}
          <div className="md:hidden">
            {activeTab === 'general' && <OrderGeneralInfo order={order} />}
            {activeTab === 'items' && <OrderItems order={order} />}
            {activeTab === 'shipping' && <OrderShipping order={order} />}
            {activeTab === 'payments' && <OrderPayments order={order} />}
          </div>
        </div>
      </DialogContent>
      
      <OrderCancelDialog
        order={order}
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
      />
    </Dialog>
  )
}
