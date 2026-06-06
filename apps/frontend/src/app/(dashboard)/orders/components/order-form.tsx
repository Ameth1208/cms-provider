'use client'

import { useEffect, useState } from 'react'
import { Search, Minus, Plus, Package, X, User } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTranslation } from '@/i18n/use-translation'
import { useOrdersStore } from '../store/orders-store'
import { useOrders } from '../hooks/use-orders'

export function OrderForm() {
  const { t } = useTranslation()
  const createOpen = useOrdersStore((s) => s.createOpen)
  const closeCreate = useOrdersStore((s) => s.closeCreate)
  const { createOrder, searchCustomers, searchProducts } = useOrders()
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [cQuery, setCQuery] = useState('')
  const [pQuery, setPQuery] = useState('')
  const [customer, setCustomer] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [ship, setShip] = useState({ name: '', email: '', phone: '', address: '', city: '', state: '', zip: '', country: 'AR', notes: '' })

  useEffect(() => { if (createOpen) { searchCustomers('').then(setCustomers); searchProducts('').then(setProducts); reset() } }, [createOpen])

  const reset = () => { setCQuery(''); setPQuery(''); setCustomer(null); setItems([]); setShip({ name: '', email: '', phone: '', address: '', city: '', state: '', zip: '', country: 'AR', notes: '' }) }

  const filterCustomers = async (q: string) => { setCQuery(q); setCustomers(await searchCustomers(q)) }
  const filterProducts = async (q: string) => { setPQuery(q); setProducts(await searchProducts(q)) }

  const selectCustomer = (c: any) => {
    setCustomer(c)
    setShip((s) => ({ ...s, name: c.name, email: c.email, phone: c.phone || '' }))
  }

  const qty = (id: string) => items.find((i) => i.catalogItemId === id)?.quantity || 0

  const adjust = (p: any, delta: number) => {
    const q = qty(p.id)
    if (q === 0 && delta > 0) setItems([...items, { catalogItemId: p.id, name: p.name, price: p.price, quantity: 1, imageUrl: p.media?.[0]?.url }])
    else if (q + delta <= 0) setItems(items.filter((i) => i.catalogItemId !== p.id))
    else setItems(items.map((i) => i.catalogItemId === p.id ? { ...i, quantity: q + delta } : i))
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)

  const submit = async () => {
    if (!items.length) return
    await createOrder({ customerId: customer?.id, customerName: ship.name, customerEmail: ship.email, customerPhone: ship.phone, shippingAddress: ship.address, shippingCity: ship.city, shippingState: ship.state, shippingZip: ship.zip, shippingCountry: ship.country, notes: ship.notes, items: items.map((i) => ({ catalogItemId: i.catalogItemId, quantity: i.quantity })) })
    closeCreate()
  }

  return (
    <Dialog open={createOpen} onOpenChange={(o) => { if (!o) closeCreate() }}>
      <DialogContent className="rounded-2xl max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-medium">{t('orders_create')}</DialogTitle><DialogDescription className="font-light">{t('orders_create_desc')}</DialogDescription></DialogHeader>

        <div className="space-y-6 py-4">
          <section className="space-y-3">
            <p className="text-sm font-medium">{t('orders_select_customer')}</p>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={t('customers_search')} value={cQuery} onChange={(e) => filterCustomers(e.target.value)} className="pl-10" /></div>
            {customer && <div className="bg-primary/5 border border-border rounded-lg p-3 flex items-center justify-between"><div className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /><div><p className="text-sm font-medium">{customer.name}</p><p className="text-xs text-muted-foreground">{customer.email}</p></div></div><Button variant="ghost" size="sm" onClick={() => setCustomer(null)}><X className="h-4 w-4" /></Button></div>}
            {!customer && (
              <div className="rounded-lg border border-border overflow-hidden max-h-48 overflow-y-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>{t('customers_name')}</TableHead><TableHead>{t('customers_email')}</TableHead><TableHead className="w-20" /></TableRow></TableHeader>
                  <TableBody>
                    {customers.map((c) => (
                      <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => selectCustomer(c)}>
                        <TableCell className="text-sm">{c.name}</TableCell>
                        <TableCell className="text-sm">{c.email}</TableCell>
                        <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); selectCustomer(c) }}>{t('select')}</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('customers_name')}</Label><Input value={ship.name} onChange={(e) => setShip({ ...ship, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t('customers_email')}</Label><Input type="email" value={ship.email} onChange={(e) => setShip({ ...ship, email: e.target.value })} /></div>
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-sm font-medium">{t('orders_select_products')}</p>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={t('catalog_search')} value={pQuery} onChange={(e) => filterProducts(e.target.value)} className="pl-10" /></div>
            <div className="rounded-lg border border-border overflow-hidden max-h-64 overflow-y-auto">
              <Table>
                <TableHeader><TableRow><TableHead>{t('inventory_product')}</TableHead><TableHead className="text-right">{t('catalog_price')}</TableHead><TableHead className="text-center w-32">{t('quantity')}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {products.map((p) => {
                    const q = qty(p.id)
                    return (
                      <TableRow key={p.id} className={q > 0 ? 'bg-primary/5' : ''}>
                        <TableCell className="text-sm">{p.name}</TableCell>
                        <TableCell className="text-right text-sm">${p.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            {q > 0 ? (
                              <>
                                <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => adjust(p, -1)}><Minus className="h-3 w-3" /></Button>
                                <span className="text-sm font-medium w-6 text-center">{q}</span>
                                <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => adjust(p, 1)}><Plus className="h-3 w-3" /></Button>
                              </>
                            ) : <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => adjust(p, 1)}>{t('add')}</Button>}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {items.length > 0 && (
              <div className="border border-border rounded-lg divide-y">
                {items.map((i) => (
                  <div key={i.catalogItemId} className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2"><div className="h-8 w-8 rounded bg-muted flex items-center justify-center">{i.imageUrl ? <img src={i.imageUrl} className="h-full w-full object-cover" /> : <Package className="h-3.5 w-3.5 text-muted-foreground" />}</div><span className="text-sm">{i.name}</span></div>
                    <span className="text-sm font-medium">${(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="px-4 py-2 flex justify-between items-center bg-muted/30"><span className="text-sm font-medium">{t('orders_subtotal')}</span><span className="font-bold">${subtotal.toFixed(2)}</span></div>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <p className="text-sm font-medium">{t('orders_shipping_info')}</p>
            <div className="space-y-2"><Label>{t('orders_address')}</Label><Input value={ship.address} onChange={(e) => setShip({ ...ship, address: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('orders_city')}</Label><Input value={ship.city} onChange={(e) => setShip({ ...ship, city: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t('orders_state')}</Label><Input value={ship.state} onChange={(e) => setShip({ ...ship, state: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('orders_zip')}</Label><Input value={ship.zip} onChange={(e) => setShip({ ...ship, zip: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t('orders_country')}</Label><Input value={ship.country} onChange={(e) => setShip({ ...ship, country: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>{t('orders_notes')}</Label><Input value={ship.notes} onChange={(e) => setShip({ ...ship, notes: e.target.value })} /></div>
          </section>

          <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
            <div><p className="text-sm font-medium">{t('orders_total')}</p><p className="text-xs text-muted-foreground">{items.length} {t('items').toLowerCase()}</p></div>
            <p className="text-xl font-bold">${subtotal.toFixed(2)}</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeCreate}>{t('cancel')}</Button>
            <Button onClick={submit} disabled={!ship.name || !ship.email || !items.length}>{t('orders_create')}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
