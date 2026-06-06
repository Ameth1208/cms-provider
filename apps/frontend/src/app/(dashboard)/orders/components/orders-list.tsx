'use client'

import { useState } from 'react'
import { Eye, Truck, Package, Clock, CheckCircle, XCircle, GripVertical, User, MapPin } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/i18n/use-translation'
import { useOrdersStore } from '../store/orders-store'
import { useOrders } from '../hooks/use-orders'

const C: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700', CONFIRMED: 'bg-blue-100 text-blue-700', PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700', DELIVERED: 'bg-emerald-100 text-emerald-700', CANCELLED: 'bg-red-100 text-red-700',
}

const COLS = [
  { key: 'PENDING', icon: Clock, color: 'bg-amber-500' },
  { key: 'CONFIRMED', icon: CheckCircle, color: 'bg-blue-500' },
  { key: 'PROCESSING', icon: Package, color: 'bg-purple-500' },
  { key: 'SHIPPED', icon: Truck, color: 'bg-indigo-500' },
  { key: 'DELIVERED', icon: CheckCircle, color: 'bg-emerald-500' },
  { key: 'CANCELLED', icon: XCircle, color: 'bg-red-500' },
]

const SK = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const HD = ['orders_table_id', 'orders_table_customer', 'total', 'orders_table_status', 'orders_table_payment', 'shipping', 'orders_table_date', 'orders_table_actions']

export function OrdersList() {
  const { t } = useTranslation()
  const orders = useOrdersStore((s) => s.orders)
  const viewMode = useOrdersStore((s) => s.viewMode)
  const openDetail = useOrdersStore((s) => s.openDetail)
  const { updateStatus } = useOrders()
  const [dragged, setDragged] = useState<any>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  if (!orders.length) return <p className="text-muted-foreground text-center py-8">{t('orders_empty')}</p>

  if (viewMode === 'table') return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader><TableRow>{HD.map((h) => <TableHead key={h} className="text-xs tracking-wider uppercase">{t(h)}</TableHead>)}</TableRow></TableHeader>
        <TableBody>{orders.map((o) => (
          <TableRow key={o.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDetail(o.id)}>
            <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}</TableCell>
            <TableCell><div><p className="text-sm font-medium">{o.customerName}</p><p className="text-xs text-muted-foreground">{o.customerEmail}</p></div></TableCell>
            <TableCell className="font-medium">${o.total.toFixed(2)}</TableCell>
            <TableCell><Badge variant="secondary" className={`text-[10px] ${C[o.status]}`}>{t(`order_status_${o.status.toLowerCase()}`)}</Badge></TableCell>
            <TableCell><Badge variant="secondary" className={`text-[10px] ${C[o.paymentStatus]}`}>{t(`payment_status_${o.paymentStatus.toLowerCase()}`)}</Badge></TableCell>
            <TableCell>{o.carrier ? <div className="flex items-center gap-1 text-xs text-muted-foreground"><Truck className="h-3 w-3" /><span>{o.carrier}</span></div> : <span className="text-xs text-muted-foreground">{t('na')}</span>}</TableCell>
            <TableCell className="text-muted-foreground text-xs">{new Date(o.createdAt).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                  <SelectTrigger className="w-[130px] h-8 text-xs" onClick={(e) => e.stopPropagation()}><SelectValue /></SelectTrigger>
                  <SelectContent>{SK.map((s) => <SelectItem key={s} value={s} className="text-xs">{t(`order_status_${s.toLowerCase()}`)}</SelectItem>)}</SelectContent>
                </Select>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); openDetail(o.id) }}><Eye className="h-4 w-4" /></Button>
              </div>
            </TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
    </div>
  )

  if (viewMode === 'cards') return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{orders.map((o) => (
      <Card key={o.id} className="cursor-pointer hover:shadow-md transition-all" onClick={() => openDetail(o.id)}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-muted"><Package className="h-4 w-4 text-primary" /></div>
              <div><p className="font-mono text-xs text-muted-foreground">#{o.id.slice(-6).toUpperCase()}</p><p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</p></div>
            </div>
            <Badge className={`text-[10px] ${C[o.paymentStatus]}`}>{o.paymentStatus}</Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><User className="h-5 w-5 text-primary" /></div>
            <div className="min-w-0"><p className="text-sm font-medium truncate">{o.customerName}</p><p className="text-xs text-muted-foreground truncate">{o.customerEmail}</p></div>
          </div>
          {o.items.slice(0, 2).map((i) => <div key={i.id} className="flex justify-between text-sm"><span className="truncate">{i.catalogItemName}</span><span className="text-muted-foreground">x{i.quantity}</span></div>)}
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /><span className="truncate max-w-[120px]">{o.shippingCity || t('no_address')}</span></div>
            <p className="text-lg font-bold">${o.total.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>
    ))}</div>
  )

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">{COLS.map((col) => {
      const Icon = col.icon
      const cols = orders.filter((o) => o.status === col.key)
      return (
        <div key={col.key} className={`flex-shrink-0 w-80 flex flex-col gap-3 ${dragOver === col.key ? 'bg-muted/50 rounded-xl p-2' : ''}`} onDragOver={(e) => { e.preventDefault(); setDragOver(col.key) }} onDrop={(e) => { e.preventDefault(); setDragOver(null); if (dragged && dragged.status !== col.key) updateStatus(dragged.id, col.key); setDragged(null) }}>
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2"><div className={`h-3 w-3 rounded-full ${col.color}`} /><span className="font-medium text-sm">{t(`order_status_${col.key.toLowerCase()}`)}</span><Badge variant="secondary" className="text-[10px]">{cols.length}</Badge></div>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-2 min-h-[200px]">{cols.map((o) => (
            <div key={o.id} draggable onDragStart={() => setDragged(o)} onClick={() => openDetail(o.id)} className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2"><GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" /><span className="font-mono text-xs text-muted-foreground">#{o.id.slice(-6).toUpperCase()}</span></div>
                <Badge variant="secondary" className={`text-[10px] ${C[o.paymentStatus]}`}>{o.paymentStatus}</Badge>
              </div>
              <p className="text-sm font-medium mb-1 truncate">{o.customerName}</p>
              <p className="text-xs text-muted-foreground mb-2">{o.customerEmail}</p>
              <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{o.items.length} {t('items').toLowerCase()}</span><span className="font-bold">${o.total.toFixed(2)}</span></div>
            </div>
          ))}</div>
        </div>
      )
    })}</div>
  )
}
