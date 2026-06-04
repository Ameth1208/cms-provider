'use client'

import { useState } from 'react'
import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  XCircle,
  GripVertical,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/i18n/use-translation'
import { useOrders } from '../hooks/use-orders'

const COLUMNS = [
  { key: 'PENDING', label: 'Pendiente', icon: Clock, color: 'bg-amber-500' },
  { key: 'CONFIRMED', label: 'Confirmado', icon: CheckCircle, color: 'bg-blue-500' },
  { key: 'PROCESSING', label: 'Procesando', icon: Package, color: 'bg-purple-500' },
  { key: 'SHIPPED', label: 'Enviado', icon: Truck, color: 'bg-indigo-500' },
  { key: 'DELIVERED', label: 'Entregado', icon: CheckCircle, color: 'bg-emerald-500' },
  { key: 'CANCELLED', label: 'Cancelado', icon: XCircle, color: 'bg-red-500' },
]

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  PARTIAL: 'bg-blue-100 text-blue-700',
  REFUNDED: 'bg-gray-100 text-gray-700',
}

export function OrdersKanbanView({ onSelect }: { onSelect: (order: any) => void }) {
  const { t } = useTranslation()
  const { orders, updateStatus } = useOrders()
  const [draggedOrder, setDraggedOrder] = useState<any>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const handleDragStart = (order: any) => {
    setDraggedOrder(order)
  }

  const handleDragOver = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault()
    setDragOverColumn(columnKey)
  }

  const handleDrop = async (e: React.DragEvent, columnKey: string) => {
    e.preventDefault()
    setDragOverColumn(null)
    
    if (draggedOrder && draggedOrder.status !== columnKey) {
      await updateStatus(draggedOrder.id, columnKey)
    }
    setDraggedOrder(null)
  }

  const getColumnOrders = (status: string) => {
    return orders.filter((o) => o.status === status)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((column) => {
        const ColumnIcon = column.icon
        const columnOrders = getColumnOrders(column.key)
        const isDragOver = dragOverColumn === column.key

        return (
          <div
            key={column.key}
            className={`flex-shrink-0 w-80 flex flex-col gap-3 transition-colors ${
              isDragOver ? 'bg-muted/50 rounded-xl p-2' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, column.key)}
            onDrop={(e) => handleDrop(e, column.key)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${column.color}`} />
                <span className="font-medium text-sm">{column.label}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {columnOrders.length}
                </Badge>
              </div>
              <ColumnIcon className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Orders */}
            <div className="flex flex-col gap-2 min-h-[200px]">
              {columnOrders.map((order) => (
                <div
                  key={order.id}
                  draggable
                  onDragStart={() => handleDragStart(order)}
                  onClick={() => onSelect(order)}
                  className="bg-card border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
                      <span className="font-mono text-xs text-muted-foreground">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${
                        PAYMENT_STATUS_COLORS[order.paymentStatus] || ''
                      }`}
                    >
                      {order.paymentStatus}
                    </Badge>
                  </div>

                  <p className="text-sm font-medium mb-1 truncate">
                    {order.customerName}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {order.customerEmail}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {order.items.length} {t('items').toLowerCase()}
                    </span>
                    <span className="font-bold">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
