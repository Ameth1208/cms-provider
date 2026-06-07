'use client'

import { useEffect, useState, useRef } from 'react'
import { Search, Minus, Plus, Package, X, User, Truck, ClipboardList, ShoppingCart } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTranslation } from '@/i18n/use-translation'
import { formatPrice } from '@/lib/utils'
import { CountrySelect } from '@/components/ui/country-select'
import { COUNTRIES } from '@/lib/countries'
import { useOrdersStore } from '../store/orders-store'
import { useOrders } from '../hooks/use-orders'

type TabKey = 'data' | 'products' | 'summary'

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
  const [ship, setShip] = useState({ name: '', email: '', phone: '', address: '', city: '', state: '', zip: '', country: 'CO', notes: '' })
  const [activeTab, setActiveTab] = useState<TabKey>('data')
  const [custOpen, setCustOpen] = useState(false)
  const custInputRef = useRef<HTMLInputElement>(null)
  const custDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (createOpen) { searchCustomers('').then(setCustomers); searchProducts('').then(setProducts); reset(); setActiveTab('data') } }, [createOpen])

  // Close customer dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (custDropdownRef.current && !custDropdownRef.current.contains(event.target as Node)) {
        setCustOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside, true)
    return () => document.removeEventListener('mousedown', handleClickOutside, true)
  }, [])

  const reset = () => { setCQuery(''); setPQuery(''); setCustomer(null); setItems([]); setShip({ name: '', email: '', phone: '', address: '', city: '', state: '', zip: '', country: 'CO', notes: '' }); setCustOpen(false) }

  const filterCustomers = async (q: string) => { setCQuery(q); setCustomers(await searchCustomers(q)) }
  const filterProducts = async (q: string) => { setPQuery(q); setProducts(await searchProducts(q)) }

  const selectCustomer = (c: any) => {
    setCustomer(c)
    setShip((s) => ({ ...s, name: c.name, email: c.email, phone: c.phone || '' }))
    setCustOpen(false)
    setCQuery('')
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

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: 'data', label: t('order_tab_data'), icon: ClipboardList },
    { key: 'products', label: t('order_tab_products'), icon: ShoppingCart },
    { key: 'summary', label: t('order_tab_summary'), icon: Truck },
  ]

  const tabVisible = (key: TabKey) => activeTab === key ? 'block' : 'hidden lg:block'

  return (
    <Dialog open={createOpen} onOpenChange={(o) => { if (!o) closeCreate() }}>
      <DialogContent className="rounded-2xl max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="font-medium">{t('orders_create')}</DialogTitle>
          <DialogDescription className="font-light">{t('orders_create_desc')}</DialogDescription>
        </DialogHeader>

        {/* Mobile Tabs */}
        <div className="lg:hidden flex gap-2 px-6 pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'default' : 'outline'}
              size="sm"
              className="flex-1 gap-1"
              onClick={() => setActiveTab(tab.key)}
            >
              <tab.icon className="h-4 w-4" />
              <span className="text-xs">{tab.label}</span>
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-6 pb-6">
          {/* Column 1: Order Data */}
          <div className={`space-y-4 ${tabVisible('data')}`}>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
              <ClipboardList className="h-4 w-4" />
              {t('orders_shipping_info')}
            </div>

            {/* Customer Selection with Popover */}
            <div className="space-y-2">
              <Label className="text-xs">{t('orders_select_customer')}</Label>
              {customer ? (
                <div className="bg-primary/5 border border-border rounded-lg p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {customer.avatarUrl ? (
                        <img src={customer.avatarUrl} alt="" className="h-full w-full object-cover rounded-full" />
                      ) : (
                        <User className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{customer.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 flex-shrink-0" onClick={() => setCustomer(null)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="relative" ref={custDropdownRef}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Input
                    ref={custInputRef}
                    placeholder={t('customers_search')}
                    value={cQuery}
                    onChange={(e) => {
                      setCQuery(e.target.value)
                      filterCustomers(e.target.value)
                      setCustOpen(true)
                    }}
                    onFocus={() => setCustOpen(true)}
                    onKeyDown={(e) => { if (e.key === 'Escape') setCustOpen(false) }}
                    className="pl-10 h-9 text-sm"
                  />

                  {custOpen && (
                    <div className="absolute z-50 w-full mt-1 rounded-md border border-border bg-popover shadow-md overflow-hidden">
                      <div className="max-h-56 overflow-y-auto">
                        {customers.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            {t('customers_no_results')}
                          </div>
                        ) : (
                          <div className="divide-y">
                            {customers.slice(0, 6).map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                                onClick={() => selectCustomer(c)}
                              >
                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  {c.avatarUrl ? (
                                    <img src={c.avatarUrl} alt="" className="h-full w-full object-cover rounded-full" />
                                  ) : (
                                    <User className="h-4 w-4 text-primary" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">{c.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                                </div>
                                <div className="text-xs text-muted-foreground flex-shrink-0">
                                  {c.phone}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shipping Info */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">{t('customers_name')}</Label>
                  <Input value={ship.name} onChange={(e) => setShip({ ...ship, name: e.target.value })} className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('customers_email')}</Label>
                  <Input type="email" value={ship.email} onChange={(e) => setShip({ ...ship, email: e.target.value })} className="h-9 text-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t('customers_phone')}</Label>
                <Input value={ship.phone} onChange={(e) => setShip({ ...ship, phone: e.target.value })} className="h-9 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t('orders_address')}</Label>
                <Input value={ship.address} onChange={(e) => setShip({ ...ship, address: e.target.value })} className="h-9 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">{t('orders_city')}</Label>
                  <Input value={ship.city} onChange={(e) => setShip({ ...ship, city: e.target.value })} className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('orders_state')}</Label>
                  <Input value={ship.state} onChange={(e) => setShip({ ...ship, state: e.target.value })} className="h-9 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">{t('orders_zip')}</Label>
                  <Input value={ship.zip} onChange={(e) => setShip({ ...ship, zip: e.target.value })} className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('orders_country')}</Label>
                  <CountrySelect value={ship.country} onChange={(code) => setShip({ ...ship, country: code })} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t('orders_notes')}</Label>
                <Input value={ship.notes} onChange={(e) => setShip({ ...ship, notes: e.target.value })} className="h-9 text-sm" />
              </div>
            </div>
          </div>

          {/* Column 2: Products */}
          <div className={`space-y-4 ${tabVisible('products')}`}>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
              <ShoppingCart className="h-4 w-4" />
              {t('orders_select_products')}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('catalog_search')} value={pQuery} onChange={(e) => filterProducts(e.target.value)} className="pl-10 h-9 text-sm" />
            </div>

            <div className="rounded-lg border border-border overflow-hidden max-h-[calc(90vh-280px)] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs h-8 w-10"></TableHead>
                    <TableHead className="text-xs h-8">{t('inventory_product')}</TableHead>
                    <TableHead className="text-right text-xs h-8">{t('catalog_price')}</TableHead>
                    <TableHead className="text-center w-28 text-xs h-8">{t('quantity')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => {
                    const q = qty(p.id)
                    return (
                      <TableRow key={p.id} className={q > 0 ? 'bg-primary/5' : ''}>
                        <TableCell className="py-1.5">
                          <div className="h-9 w-9 rounded bg-muted flex items-center justify-center">
                            {p.media?.[0]?.url ? (
                              <img src={p.media[0].url} alt="" className="h-full w-full object-cover rounded" />
                            ) : (
                              <Package className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm py-1.5">{p.name}</TableCell>
                        <TableCell className="text-right text-sm py-1.5">{formatPrice(p.price)}</TableCell>
                        <TableCell className="py-1.5">
                          <div className="flex items-center justify-center gap-1">
                            {q > 0 ? (
                              <>
                                <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => adjust(p, -1)}>
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm font-medium w-5 text-center">{q}</span>
                                <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => adjust(p, 1)}>
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </>
                            ) : (
                              <Button variant="outline" size="sm" className="h-6 px-2 text-xs" onClick={() => adjust(p, 1)}>
                                {t('add')}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Column 3: Summary */}
          <div className={`flex flex-col gap-4 ${tabVisible('summary')} lg:h-[calc(90vh-180px)]`}>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
              <Truck className="h-4 w-4" />
              {t('order_tab_summary')}
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground flex-1">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('orders_no_items')}</p>
              </div>
            ) : (
              <>
                {/* Items list - scrollable */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  <div className="rounded-lg border border-border divide-y divide-border">
                    {items.map((i) => (
                      <div key={i.catalogItemId} className="px-3 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                            {i.imageUrl ? (
                              <img src={i.imageUrl} alt="" className="h-full w-full object-cover rounded" />
                            ) : (
                              <Package className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm truncate">{i.name}</p>
                            <p className="text-xs text-muted-foreground">{i.quantity} x {formatPrice(i.price)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm font-medium">{formatPrice(i.price * i.quantity)}</span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => adjust({ id: i.catalogItemId }, -i.quantity)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sticky summary */}
                <div className="space-y-3 flex-shrink-0">
                  <div className="rounded-lg bg-muted p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('orders_subtotal')}</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('shipping')}</span>
                      <span className="font-medium">{t('free')}</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between items-center">
                      <span className="font-medium">{t('orders_total')}</span>
                      <span className="text-xl font-bold">{formatPrice(subtotal)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={closeCreate}>{t('cancel')}</Button>
                    <Button className="flex-1" onClick={submit} disabled={!ship.name || !ship.email}>{t('orders_create')}</Button>
                  </div>

                  <div className="rounded-lg border border-border p-3 space-y-1.5 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">{t('delivery_to')}</p>
                    <p className="font-medium text-foreground">{ship.name}</p>
                    {ship.phone && <p>{ship.phone}</p>}
                    {ship.address && <p>{ship.address}</p>}
                    {(ship.city || ship.state) && <p>{[ship.city, ship.state].filter(Boolean).join(', ')} {ship.zip}</p>}
                    {ship.country && <p>{COUNTRIES.find(c => c.code === ship.country)?.name || ship.country}</p>}
                    {ship.notes && <p className="italic mt-1">{ship.notes}</p>}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
