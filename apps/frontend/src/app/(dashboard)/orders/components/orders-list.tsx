'use client'

import { useState } from 'react'
import { Eye, ChevronDown } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  PENDING: {
    label: 'Pendiente',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  CONFIRMED: {
    label: 'Confirmado',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  PROCESSING: {
    label: 'Procesando',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    dot: 'bg-purple-500',
  },
  SHIPPED: {
    label: 'Enviado',
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    dot: 'bg-indigo-500',
  },
  DELIVERED: {
    label: 'Entregado',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
    dot: 'bg-red-500',
  },
}

const STATUS_KEYS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export function OrdersList() {
  const { t } = useTranslation()
  const orders = useOrdersStore((s) => s.orders)
  const openDetail = useOrdersStore((s) => s.openDetail)
  const { updateStatus } = useOrders()

  if (!orders.length) {
    return <p className="text-muted-foreground text-center py-8">{t('orders_empty')}</p>
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs tracking-wider uppercase">{t('orders_table_id')}</TableHead>
            <TableHead className="text-xs tracking-wider uppercase">{t('orders_table_customer')}</TableHead>
            <TableHead className="text-xs tracking-wider uppercase">{t('total')}</TableHead>
            <TableHead className="text-xs tracking-wider uppercase">{t('orders_table_status')}</TableHead>
            <TableHead className="text-xs tracking-wider uppercase">{t('orders_table_payment')}</TableHead>
            <TableHead className="text-xs tracking-wider uppercase">{t('shipping')}</TableHead>
            <TableHead className="text-xs tracking-wider uppercase">{t('orders_table_date')}</TableHead>
            <TableHead className="text-right text-xs tracking-wider uppercase">{t('orders_table_actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING
            return (
              <TableRow
                key={order.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => openDetail(order.id)}
              >
                <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="focus:outline-none">
                        <Badge
                          variant="outline"
                          className={`text-[10px] cursor-pointer hover:opacity-80 transition-opacity ${statusConfig.color}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot} mr-1.5`} />
                          {t(`order_status_${order.status.toLowerCase()}`)}
                          <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
                        </Badge>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {STATUS_KEYS.map((status) => {
                        const config = STATUS_CONFIG[status]
                        return (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => updateStatus(order.id, status)}
                            className="text-xs cursor-pointer"
                          >
                            <span className={`h-2 w-2 rounded-full ${config.dot} mr-2`} />
                            {t(`order_status_${status.toLowerCase()}`)}
                            {order.status === status && (
                              <span className="ml-auto text-[10px] text-muted-foreground">✓</span>
                            )}
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="text-[10px] bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
                  >
                    {t(`payment_status_${order.paymentStatus.toLowerCase()}`)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {order.carrier ? (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>{order.carrier}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      openDetail(order.id)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
