'use client'

import { useState } from 'react'
import {
  X,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  User,
  Calendar,
  Plus,
  Trash2,
  Search,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Pendiente', icon: Clock },
  { key: 'CONFIRMED', label: 'Confirmado', icon: CheckCircle },
  { key: 'PROCESSING', label: 'Procesando', icon: Package },
  { key: 'SHIPPED', label: 'Enviado', icon: Truck },
  { key: 'DELIVERED', label: 'Entregado', icon: CheckCircle },
]

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pago pendiente', color: 'bg-amber-100 text-amber-700' },
  PAID: { label: 'Pagado', color: 'bg-emerald-100 text-emerald-700' },
  PARTIAL: { label: 'Pago parcial', color: 'bg-blue-100 text-blue-700' },
  REFUNDED: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-700' },
}

export function OrderDetailDialog({ order, open, onOpenChange }: {
  order: any
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const { token } = useAuth()
  const { updateStatus, updateShippingStatus, addOrderItem, removeOrderItem, updateOrder } = useOrders()
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'shipping' | 'payments'>('overview')
  const [searchProduct, setSearchProduct] = useState('')
  const [products, setProducts] = useState<CatalogItem[]>([])
  const [trackingForm, setTrackingForm] = useState({ carrier: '', trackingNumber: '' })
  const [showTrackingForm, setShowTrackingForm] = useState(false)

  if (!order) return null

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status)
  const paymentStatus = PAYMENT_STATUS_CONFIG[order.paymentStatus] || PAYMENT_STATUS_CONFIG.PENDING

  const searchProducts = async (q: string) => {
    if (!token || q.length < 2) return
    try {
      const data = await api.get<CatalogItem[]>(`/catalog?search=${encodeURIComponent(q)}`, token)
      setProducts(data)
    } catch {
      setProducts([])
    }
  }

  const handleAddItem = async (item: CatalogItem) => {
    await addOrderItem(order.id, { catalogItemId: item.id, quantity: 1 })
    setSearchProduct('')
    setProducts([])
  }

  const handleRemoveItem = async (itemId: string) => {
    await removeOrderItem(order.id, itemId)
  }

  const handleUpdateTracking = async () => {
    await updateShippingStatus(order.id, 'SHIPPED', trackingForm.carrier, trackingForm.trackingNumber)
    setShowTrackingForm(false)
    setTrackingForm({ carrier: '', trackingNumber: '' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b p-6 z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <p className="font-mono text-sm text-muted-foreground">
                  #{order.id.slice(-6).toUpperCase()}
                </p>
                <Badge className={`text-[10px] ${paymentStatus.color}`}>
                  {paymentStatus.label}
                </Badge>
              </div>
              <DialogTitle className="text-2xl">${order.total.toFixed(2)}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString('es-AR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress tracker */}
          <div className="mt-6">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-muted -translate-y-1/2" />
              <div
                className="absolute left-0 top-1/2 h-0.5 bg-primary -translate-y-1/2 transition-all"
                style={{
                  width: `${Math.max(0, Math.min(100, (currentStepIndex / (STATUS_STEPS.length - 1)) * 100))}%`,
                }}
              />
              {STATUS_STEPS.map((step, index) => {
                const StepIcon = step.icon
                const isActive = index <= currentStepIndex
                const isCurrent = index === currentStepIndex

                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center gap-1">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                    >
                      <StepIcon className="h-4 w-4" />
                    </div>
                    <span className={`text-[10px] ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6">
            {[
              { key: 'overview', label: t('overview') },
              { key: 'items', label: `${t('items')} (${order.items.length})` },
              { key: 'shipping', label: t('shipping') },
              { key: 'payments', label: t('payments') },
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.key as any)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Customer info */}
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-sm font-medium mb-3">{t('customer_info')}</p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                    {order.customerPhone && (
                      <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order summary */}
              <div className="space-y-3">
                <p className="text-sm font-medium">{t('order_summary')}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('subtotal')}</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('discount')}</span>
                      <span className="text-green-600">-${order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {order.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('tax')}</span>
                      <span>${order.tax.toFixed(2)}</span>
                    </div>
                  )}
                  {order.shippingCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('shipping')}</span>
                      <span>${order.shippingCost.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>{t('total')}</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Status update */}
              <div className="space-y-3">
                <p className="text-sm font-medium">{t('update_status')}</p>
                <div className="flex gap-2">
                  {STATUS_STEPS.map((step) => (
                    <Button
                      key={step.key}
                      variant={order.status === step.key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateStatus(order.id, step.key)}
                    >
                      {step.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'items' && (
            <div className="space-y-4">
              {/* Add item */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('search_products')}
                  value={searchProduct}
                  onChange={(e) => {
                    setSearchProduct(e.target.value)
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
                      onClick={() => handleAddItem(p)}
                    >
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">SKU: {p.sku || 'N/A'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">${p.price.toFixed(2)}</span>
                        <Plus className="h-4 w-4 text-primary" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Items list */}
              <div className="space-y-2">
                {order.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.catalogItemName}</p>
                        <p className="text-xs text-muted-foreground">
                          ${item.unitPrice.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium">${item.totalPrice.toFixed(2)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-6">
              {/* Shipping address */}
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{t('shipping_address')}</p>
                </div>
                <div className="space-y-1">
                  <p>{order.shippingAddress || t('no_address')}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.shippingCity}, {order.shippingState} {order.shippingZip}
                  </p>
                  <p className="text-sm text-muted-foreground">{order.shippingCountry}</p>
                </div>
              </div>

              {/* Tracking info */}
              <div className="space-y-3">
                <p className="text-sm font-medium">{t('tracking_info')}</p>
                
                {order.trackingNumber ? (
                  <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-primary" />
                        <span className="font-medium">{order.carrier || 'Transportista'}</span>
                      </div>
                      <Badge variant="secondary">{order.shippingStatus}</Badge>
                    </div>
                    <p className="font-mono text-sm">{order.trackingNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.shippedAt && `Enviado el ${new Date(order.shippedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {!showTrackingForm ? (
                      <Button
                        variant="outline"
                        onClick={() => setShowTrackingForm(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('add_tracking')}
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder={t('carrier')}
                            value={trackingForm.carrier}
                            onChange={(e) => setTrackingForm({ ...trackingForm, carrier: e.target.value })}
                          />
                          <Input
                            placeholder={t('tracking_number')}
                            value={trackingForm.trackingNumber}
                            onChange={(e) => setTrackingForm({ ...trackingForm, trackingNumber: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setShowTrackingForm(false)}>
                            {t('cancel')}
                          </Button>
                          <Button
                            onClick={handleUpdateTracking}
                            disabled={!trackingForm.carrier || !trackingForm.trackingNumber}
                          >
                            {t('save')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              {order.payments?.length > 0 ? (
                order.payments.map((payment: any) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{payment.method}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${payment.amount.toFixed(2)}</p>
                      <Badge variant="secondary" className="text-[10px]">
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p>{t('no_payments')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
