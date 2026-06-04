'use client'

import { useState } from 'react'
import {
  Eye,
  Truck,
  CreditCard,
  ChevronDown,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useOrders } from '../hooks/use-orders'
import { OrderDetailDialog } from './order-detail-dialog'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PROCESSING: 'Procesando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PROCESSING: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  SHIPPED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  DELIVERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  FAILED: 'Fallido',
  REFUNDED: 'Reembolsado',
  PARTIAL: 'Parcial',
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  PAID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  REFUNDED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  PARTIAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

export function OrdersTable() {
  const { orders, updateStatus } = useOrders()
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  if (orders.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No hay órdenes</p>
  }

  return (
    <>
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs tracking-wider uppercase">ID</TableHead>
              <TableHead className="text-xs tracking-wider uppercase">Cliente</TableHead>
              <TableHead className="text-xs tracking-wider uppercase">Total</TableHead>
              <TableHead className="text-xs tracking-wider uppercase">Estado</TableHead>
              <TableHead className="text-xs tracking-wider uppercase">Pago</TableHead>
              <TableHead className="text-xs tracking-wider uppercase">Envío</TableHead>
              <TableHead className="text-xs tracking-wider uppercase">Fecha</TableHead>
              <TableHead className="text-right text-xs tracking-wider uppercase">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow 
                key={order.id} 
                className="cursor-pointer hover:bg-muted/50" 
                onClick={() => {
                  setSelectedOrder(order)
                  setDetailOpen(true)
                }}
              >
                <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                  </div>
                </TableCell>
                <TableCell className="font-medium">${order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${STATUS_COLORS[order.status] || ''}`}
                  >
                    {STATUS_LABELS[order.status] || order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${PAYMENT_STATUS_COLORS[order.paymentStatus] || ''}`}
                  >
                    {PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  {(order.trackingNumber || order.carrier) ? (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Truck className="h-3 w-3" />
                      <span>{order.carrier || 'Envío'}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <select
                      value={order.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="bg-background border rounded-lg px-2 py-1 text-xs"
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedOrder(order)
                        setDetailOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <OrderDetailDialog
        order={selectedOrder}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  )
}
