'use client'

import { useState } from 'react'
import { Plus, X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/i18n/use-translation'
import { useOrders } from '../hooks/use-orders'
import { api } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'

interface CatalogItem {
  id: string
  name: string
  price: number
  sku?: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
}

export function OrderCreateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation()
  const { token } = useAuth()
  const { createOrder } = useOrders()
  
  const [step, setStep] = useState(1)
  const [customerQuery, setCustomerQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  
  const [productQuery, setProductQuery] = useState('')
  const [products, setProducts] = useState<CatalogItem[]>([])
  const [selectedItems, setSelectedItems] = useState<{ catalogItemId: string; name: string; price: number; quantity: number }[]>([])
  
  const [shippingData, setShippingData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    shippingCountry: 'AR',
    notes: '',
  })

  const searchCustomers = async (q: string) => {
    if (!token || q.length < 2) return
    setLoadingCustomers(true)
    try {
      const data = await api.get<Customer[]>(`/customers?search=${encodeURIComponent(q)}`, token)
      setCustomers(data)
    } catch {
      setCustomers([])
    } finally {
      setLoadingCustomers(false)
    }
  }

  const searchProducts = async (q: string) => {
    if (!token || q.length < 2) return
    try {
      const data = await api.get<CatalogItem[]>(`/catalog?search=${encodeURIComponent(q)}`, token)
      setProducts(data)
    } catch {
      setProducts([])
    }
  }

  const addItem = (item: CatalogItem) => {
    if (selectedItems.find((i) => i.catalogItemId === item.id)) return
    setSelectedItems([...selectedItems, { catalogItemId: item.id, name: item.name, price: item.price, quantity: 1 }])
  }

  const removeItem = (catalogItemId: string) => {
    setSelectedItems(selectedItems.filter((i) => i.catalogItemId !== catalogItemId))
  }

  const updateQuantity = (catalogItemId: string, quantity: number) => {
    if (quantity < 1) return
    setSelectedItems(selectedItems.map((i) => i.catalogItemId === catalogItemId ? { ...i, quantity } : i))
  }

  const subtotal = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const handleCreate = async () => {
    if (selectedItems.length === 0) return
    
    const data = {
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name || shippingData.customerName,
      customerEmail: selectedCustomer?.email || shippingData.customerEmail,
      customerPhone: selectedCustomer?.phone || shippingData.customerPhone,
      shippingAddress: shippingData.shippingAddress,
      shippingCity: shippingData.shippingCity,
      shippingState: shippingData.shippingState,
      shippingZip: shippingData.shippingZip,
      shippingCountry: shippingData.shippingCountry,
      notes: shippingData.notes,
      items: selectedItems.map((i) => ({ catalogItemId: i.catalogItemId, quantity: i.quantity })),
    }

    await createOrder(data)
    onOpenChange(false)
    resetForm()
  }

  const resetForm = () => {
    setStep(1)
    setSelectedCustomer(null)
    setSelectedItems([])
    setShippingData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      shippingAddress: '',
      shippingCity: '',
      shippingState: '',
      shippingZip: '',
      shippingCountry: 'AR',
      notes: '',
    })
  }

  const handleClose = (open: boolean) => {
    if (!open) resetForm()
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-medium">{t('orders_create')}</DialogTitle>
          <DialogDescription className="font-light">{t('orders_create_desc')}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm font-medium">{t('orders_select_customer')}</p>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('customers_search')}
                value={customerQuery}
                onChange={(e) => {
                  setCustomerQuery(e.target.value)
                  searchCustomers(e.target.value)
                }}
                className="pl-10"
              />
            </div>

            {customers.length > 0 && !selectedCustomer && (
              <div className="border rounded-lg divide-y">
                {customers.map((c) => (
                  <button
                    key={c.id}
                    className="w-full px-4 py-3 text-left hover:bg-muted transition-colors"
                    onClick={() => {
                      setSelectedCustomer(c)
                      setShippingData((prev) => ({
                        ...prev,
                        customerName: c.name,
                        customerEmail: c.email,
                        customerPhone: c.phone || '',
                      }))
                    }}
                  >
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </button>
                ))}
              </div>
            )}

            {selectedCustomer && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{selectedCustomer.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedCustomer.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground">{t('orders_or_manual')}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('customers_name')}</Label>
                <Input
                  value={shippingData.customerName}
                  onChange={(e) => setShippingData({ ...shippingData, customerName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('customers_email')}</Label>
                <Input
                  type="email"
                  value={shippingData.customerEmail}
                  onChange={(e) => setShippingData({ ...shippingData, customerEmail: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!shippingData.customerName || !shippingData.customerEmail}
              >
                {t('next')}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm font-medium">{t('orders_select_products')}</p>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('catalog_search')}
                value={productQuery}
                onChange={(e) => {
                  setProductQuery(e.target.value)
                  searchProducts(e.target.value)
                }}
                className="pl-10"
              />
            </div>

            {products.length > 0 && (
              <div className="border rounded-lg divide-y">
                {products.map((p) => (
                  <button
                    key={p.id}
                    className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center justify-between"
                    onClick={() => addItem(p)}
                  >
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {p.sku || 'N/A'}</p>
                    </div>
                    <p className="text-sm font-medium">${p.price.toFixed(2)}</p>
                  </button>
                ))}
              </div>
            )}

            {selectedItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">{t('orders_selected_items')}</p>
                <div className="border rounded-lg divide-y">
                  {selectedItems.map((item) => (
                    <div key={item.catalogItemId} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} c/u</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.catalogItemId, parseInt(e.target.value))}
                          className="w-20 h-8"
                        />
                        <p className="text-sm font-medium w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive"
                          onClick={() => removeItem(item.catalogItemId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2">
                  <p className="text-sm text-muted-foreground">{t('orders_subtotal')}</p>
                  <p className="text-lg font-semibold">${subtotal.toFixed(2)}</p>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                {t('back')}
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={selectedItems.length === 0}
              >
                {t('next')}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm font-medium">{t('orders_shipping_info')}</p>

            <div className="space-y-2">
              <Label>{t('orders_address')}</Label>
              <Input
                value={shippingData.shippingAddress}
                onChange={(e) => setShippingData({ ...shippingData, shippingAddress: e.target.value })}
                placeholder="Av. Corrientes 1234, Piso 3, Depto B"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('orders_city')}</Label>
                <Input
                  value={shippingData.shippingCity}
                  onChange={(e) => setShippingData({ ...shippingData, shippingCity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('orders_state')}</Label>
                <Input
                  value={shippingData.shippingState}
                  onChange={(e) => setShippingData({ ...shippingData, shippingState: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('orders_zip')}</Label>
                <Input
                  value={shippingData.shippingZip}
                  onChange={(e) => setShippingData({ ...shippingData, shippingZip: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('orders_country')}</Label>
                <Input
                  value={shippingData.shippingCountry}
                  onChange={(e) => setShippingData({ ...shippingData, shippingCountry: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('orders_notes')}</Label>
              <Input
                value={shippingData.notes}
                onChange={(e) => setShippingData({ ...shippingData, notes: e.target.value })}
                placeholder={t('orders_notes_placeholder')}
              />
            </div>

            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">{t('orders_summary')}</p>
              <div className="flex justify-between text-sm">
                <span>{t('orders_subtotal')}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>{t('orders_total')}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                {t('back')}
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!shippingData.shippingAddress || !shippingData.shippingCity}
              >
                {t('orders_create')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
