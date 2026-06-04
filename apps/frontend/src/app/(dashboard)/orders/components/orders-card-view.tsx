'use client'

import { useState } from 'react'
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  MapPin,
  CreditCard,
  User,
  Calendar,
  ChevronRight,
  Eye,
  Plus,
  Trash2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n/use-translation'
import { useOrders } from '../hooks/use-orders'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  PENDING: {
    label: 'Pendiente',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Confirmado',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    icon: CheckCircle,
  },
  PROCESSING: {
    label: 'Procesando',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    icon: Package,
  },
  SHIPPED: {
    label: 'Enviado',
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Entregado',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    icon: XCircle,
  },
}

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pago pendiente', color: 'bg-amber-100 text-amber-700' },
  PAID: { label: 'Pagado', color: 'bg-emerald-100 text-emerald-700' },
  PARTIAL: { label: 'Pago parcial', color: 'bg-blue-100 text-blue-700' },
  REFUNDED: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-700' },
}

export function OrdersCardView({ onSelect }: { onSelect: (order: any) => void }) {
  const { t } = useTranslation()
  const { orders, updateStatus } = useOrders()
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p className="text-lg">{t('orders_empty')}</p>
        <p className="text-sm">{t('orders_empty_desc')}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map((order) => {
        const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING
        const StatusIcon = status.icon
        const paymentStatus = PAYMENT_STATUS_CONFIG[order.paymentStatus] || PAYMENT_STATUS_CONFIG.PENDING
        const isHovered = hoveredId === order.id

        return (
          <Card
            key={order.id}
            className={`relative overflow-hidden cursor-pointer transition-all duration-300 ${
              isHovered ? 'shadow-lg scale-[1.02]' : 'shadow-sm'
            }`}
            onMouseEnter={() => setHoveredId(order.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onSelect(order)}
          >
            {/* Status strip */}
            <div className={`h-1.5 w-full ${status.bg.replace('bg-', 'bg-').replace('50', '500')}`} />

            <CardContent className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${status.bg}`}>
                    <StatusIcon className={`h-4 w-4 ${status.color}`} />
                  </div>
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">
                      #{order.id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('es-AR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <Badge className={`text-[10px] ${paymentStatus.color}`}>
                  {paymentStatus.label}
                </Badge>
              </div>

              {/* Customer */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{order.customerName}</p>
                  <p className="text-xs text-muted-foreground truncate">{order.customerEmail}</p>
                </div>
              </div>

              {/* Items summary */}
              <div className="space-y-2">
                {order.items.slice(0, 2).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{item.catalogItemName}</span>
                    </div>
                    <span className="text-muted-foreground shrink-0">
                      x{item.quantity}
                    </span>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p className="text-xs text-muted-foreground">
                    +{order.items.length - 2} {t('more_items')}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {order.shippingCity || t('no_address')}
                  </span>
                </div>
                <p className="text-lg font-bold">${order.total.toFixed(2)}</p>
              </div>

              {/* Quick actions on hover */}
              <div
                className={`absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background to-transparent flex justify-end gap-2 transition-opacity ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect(order)
                  }}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  {t('view')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
