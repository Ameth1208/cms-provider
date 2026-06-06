'use client'

import { useState } from 'react'
import { X, User, Package, MapPin, Truck, CreditCard, AlertCircle, Plus, Search, Link, Copy } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslation } from '@/i18n/use-translation'
import { useOrdersStore } from '../store/orders-store'
import { useOrders } from '../hooks/use-orders'
import { useDrivers } from '@/app/(dashboard)/drivers/hooks/use-drivers'

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
const PAYMENT_COLORS: Record<string, string> = { PENDING: 'bg-amber-100 text-amber-700', PAID: 'bg-emerald-100 text-emerald-700', PARTIAL: 'bg-blue-100 text-blue-700', REFUNDED: 'bg-gray-100 text-gray-700' }
const DELIVERY_STEPS = ['ASSIGNED', 'IN_PROGRESS', 'NEARBY', 'COMPLETED']
const DELIVERY_COLORS: Record<string, string> = { ASSIGNED: 'bg-blue-100 text-blue-700', IN_PROGRESS: 'bg-amber-100 text-amber-700', NEARBY: 'bg-purple-100 text-purple-700', COMPLETED: 'bg-emerald-100 text-emerald-700', FAILED: 'bg-red-100 text-red-700' }

export function OrderDetail() {
  const { t } = useTranslation()
  const detailOpen = useOrdersStore((s) => s.detailOpen)
  const closeDetail = useOrdersStore((s) => s.closeDetail)
  const selectedId = useOrdersStore((s) => s.selectedOrderId)
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === selectedId))
  const { updateStatus, updateShippingStatus, addOrderItem, removeOrderItem, searchProducts } = useOrders()
  const { drivers } = useDrivers()
  const [tab, setTab] = useState<'overview' | 'items' | 'shipping' | 'logistics' | 'payments'>('overview')
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [tracking, setTracking] = useState({ carrier: '', number: '' })

  if (!order) return null

  const handleSearch = async (q: string) => {
    setSearch(q)
    if (q.length < 2) { setProducts([]); return }
    setProducts(await searchProducts(q))
  }

  const tabs = [
    { key: 'overview', label: t('overview') },
    { key: 'items', label: `${t('items')} (${order.items.length})` },
    { key: 'shipping', label: t('shipping') },
    { key: 'logistics', label: t('logistics') },
    { key: 'payments', label: t('payments') },
  ]

  return (
    <Dialog open={detailOpen} onOpenChange={closeDetail}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <div className="sticky top-0 bg-background border-b border-border p-6 z-10">
          <DialogHeader className="mb-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2"><p className="font-mono text-sm text-muted-foreground">#{order.id.slice(-6).toUpperCase()}</p><Badge className={`text-[10px] ${PAYMENT_COLORS[order.paymentStatus] || ''}`}>{t(`payment_status_${order.paymentStatus.toLowerCase()}`)}</Badge></div>
                <DialogTitle className="text-2xl">${order.total.toFixed(2)}</DialogTitle>
                <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={closeDetail}><X className="h-4 w-4" /></Button>
            </div>
          </DialogHeader>
          <div className="flex gap-1">{tabs.map((t2) => <Button key={t2.key} variant={tab === t2.key ? 'default' : 'ghost'} size="sm" onClick={() => setTab(t2.key as any)}>{t2.label}</Button>)}</div>
        </div>

        <div className="p-6">
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-sm font-medium mb-3">{t('customer_info')}</p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center"><User className="h-6 w-6 text-primary" /></div>
                  <div><p className="font-medium">{order.customerName}</p><p className="text-sm text-muted-foreground">{order.customerEmail}</p>{order.customerPhone && <p className="text-sm text-muted-foreground">{order.customerPhone}</p>}</div>
                </div>
              </div>
              <div className="space-y-2">
                {[{ k: 'subtotal', v: order.subtotal }, { k: 'discount', v: order.discount, neg: true }, { k: 'tax', v: order.tax }, { k: 'shipping', v: order.shippingCost }].map((r) => r.v > 0 || r.k === 'subtotal' ? <div key={r.k} className="flex justify-between text-sm"><span className="text-muted-foreground">{t(r.k)}</span><span className={r.neg ? 'text-green-600' : ''}>{r.neg ? '-' : ''}${r.v.toFixed(2)}</span></div> : null)}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border"><span>{t('total')}</span><span>${order.total.toFixed(2)}</span></div>
              </div>
              <div className="space-y-3"><p className="text-sm font-medium">{t('update_status')}</p><div className="flex gap-2 flex-wrap">{STATUS_STEPS.map((s) => <Button key={s} variant={order.status === s ? 'default' : 'outline'} size="sm" onClick={() => updateStatus(order.id, s)}>{t(`order_status_${s.toLowerCase()}`)}</Button>)}</div></div>
            </div>
          )}

          {tab === 'items' && (
            <div className="space-y-4">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={t('search_products')} value={search} onChange={(e) => handleSearch(e.target.value)} className="pl-10" /></div>
              {products.length > 0 && <div className="border border-border rounded-lg divide-y">{products.map((p) => <button key={p.id} className="w-full px-4 py-3 text-left hover:bg-muted flex justify-between" onClick={() => { addOrderItem(order.id, { catalogItemId: p.id, quantity: 1 }); setSearch(''); setProducts([]) }}><span className="text-sm font-medium">{p.name}</span><span className="flex items-center gap-2"><span className="text-sm">${p.price.toFixed(2)}</span><Plus className="h-4 w-4 text-primary" /></span></button>)}</div>}
              <div className="space-y-2">{order.items.map((i) => (
                <div key={i.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Package className="h-5 w-5 text-primary" /></div><div><p className="text-sm font-medium">{i.catalogItemName}</p><p className="text-xs text-muted-foreground">${i.unitPrice.toFixed(2)} x {i.quantity}</p></div></div>
                  <div className="flex items-center gap-3"><span className="text-sm font-medium">${i.totalPrice.toFixed(2)}</span><Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => removeOrderItem(order.id, i.id)}>{t('remove')}</Button></div>
                </div>
              ))}</div>
            </div>
          )}

          {tab === 'shipping' && (
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-xl p-4"><div className="flex items-center gap-2 mb-3"><MapPin className="h-4 w-4 text-muted-foreground" /><p className="text-sm font-medium">{t('shipping_address')}</p></div><p>{order.shippingAddress || t('no_address')}</p><p className="text-sm text-muted-foreground">{order.shippingCity}, {order.shippingState} {order.shippingZip}</p><p className="text-sm text-muted-foreground">{order.shippingCountry}</p></div>
              <div className="space-y-3"><p className="text-sm font-medium">{t('tracking_info')}</p>{order.trackingNumber ? <div className="bg-muted/50 rounded-xl p-4"><div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /><span className="font-medium">{order.carrier}</span><Badge variant="secondary">{order.shippingStatus}</Badge></div><p className="font-mono text-sm mt-2">{order.trackingNumber}</p></div> : <div className="space-y-3"><div className="grid grid-cols-2 gap-3"><Input placeholder={t('carrier')} value={tracking.carrier} onChange={(e) => setTracking({ ...tracking, carrier: e.target.value })} /><Input placeholder={t('tracking_number')} value={tracking.number} onChange={(e) => setTracking({ ...tracking, number: e.target.value })} /></div><Button disabled={!tracking.carrier || !tracking.number} onClick={() => updateShippingStatus(order.id, 'SHIPPED', tracking.carrier, tracking.number)}>{t('save')}</Button></div>}</div>
            </div>
          )}

          {tab === 'logistics' && (
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-xl p-4"><p className="text-sm font-medium mb-3">{t('assign_driver')}</p>{order.driver ? <div className="flex items-center justify-between"><div><p className="font-medium">{order.driver.name}</p><p className="text-sm text-muted-foreground">{order.driver.phone}</p></div><Button variant="outline" size="sm">{t('unassign_driver')}</Button></div> : <Select onValueChange={(v) => { /* assign via API in useOrders */ }}><SelectTrigger><SelectValue placeholder={t('assign_driver')} /></SelectTrigger><SelectContent>{drivers.filter((d) => d.active).map((d) => <SelectItem key={d.id} value={d.id}>{d.name} - {d.phone}</SelectItem>)}</SelectContent></Select>}</div>
              {order.delivery && (
                <div className="bg-muted/50 rounded-xl p-4"><p className="text-sm font-medium mb-4">{t('tracking')}</p><div className="relative"><div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" /><div className="space-y-4">{DELIVERY_STEPS.map((s, i) => { const active = i <= DELIVERY_STEPS.indexOf(order.delivery?.status || ''); const event = order.delivery?.trackingEvents?.find((e: any) => e.status === s); return <div key={s} className="relative flex items-start gap-3"><div className={`h-8 w-8 rounded-full flex items-center justify-center ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}><span className="text-xs">{i + 1}</span></div><div className="pt-1"><p className="text-sm font-medium">{t(`delivery_${s.toLowerCase()}`)}</p>{event && <p className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</p>}</div></div> })}</div></div></div>
              )}
              {order.delivery && (
                <div className="bg-muted/50 rounded-xl p-4"><div className="flex items-center gap-2 mb-2"><Link className="h-4 w-4 text-muted-foreground" /><p className="text-sm font-medium">{t('tracking_link')}</p></div><div className="flex gap-2"><code className="flex-1 bg-background rounded px-3 py-2 text-sm">{typeof window !== 'undefined' ? `${window.location.origin}/tracking/${order.id}` : ''}</code><Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/tracking/${order.id}`)}><Copy className="h-4 w-4" /></Button></div></div>
              )}
            </div>
          )}

          {tab === 'payments' && (
            <div className="space-y-4">
              {order.payments?.length ? order.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><CreditCard className="h-5 w-5 text-primary" /></div><div><p className="text-sm font-medium">{p.method}</p><p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</p></div></div>
                  <div className="text-right"><p className="font-medium">${p.amount.toFixed(2)}</p><Badge variant="secondary" className="text-[10px]">{p.status}</Badge></div>
                </div>
              )) : <div className="text-center py-8 text-muted-foreground"><AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-20" /><p>{t('no_payments')}</p></div>}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
