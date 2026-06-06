'use client'

import { Eye, Truck } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslation } from '@/i18n/use-translation'
import { useOrdersStore } from '../store/orders-store'
import { useOrders } from '../hooks/use-orders'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
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
          {orders.map((order) => (
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
              <TableCell className="font-medium">${order.total.toFixed(2)}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={`text-[10px] ${STATUS_COLORS[order.status]}`}
                >
                  {t(`order_status_${order.status.toLowerCase()}`)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={`text-[10px] ${STATUS_COLORS[order.paymentStatus]}`}
                >
                  {t(`payment_status_${order.paymentStatus.toLowerCase()}`)}
                </Badge>
              </TableCell>
              <TableCell>
                {order.carrier ? (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Truck className="h-3 w-3" />
                    <span>{order.carrier}</span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">{t('na')}</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {new Date(order.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Select
                    value={order.status}
                    onValueChange={(value) => updateStatus(order.id, value)}
                  >
                    <SelectTrigger
                      className="w-[130px] h-8 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_KEYS.map((status) => (
                        <SelectItem key={status} value={status} className="text-xs">
                          {t(`order_status_${status.toLowerCase()}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
