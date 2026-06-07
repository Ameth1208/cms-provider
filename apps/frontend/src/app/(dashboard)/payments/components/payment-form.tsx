'use client'

import { useState, useCallback } from 'react'
import { Plus, CreditCard, DollarSign, ArrowLeftRight, Search, Package } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslation } from '@/i18n/use-translation'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'
import { usePayments } from '../hooks/use-payments'
import { formatPrice } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const METHOD_OPTIONS = [
  { value: 'CREDIT_CARD', label: 'credit_card', icon: CreditCard },
  { value: 'DEBIT_CARD', label: 'debit_card', icon: CreditCard },
  { value: 'CASH', label: 'cash', icon: DollarSign },
  { value: 'BANK_TRANSFER', label: 'transfer', icon: ArrowLeftRight },
  { value: 'MERCADOPAGO', label: 'mercado_pago', icon: CreditCard },
  { value: 'STRIPE', label: 'stripe', icon: CreditCard },
  { value: 'PAYPAL', label: 'paypal', icon: CreditCard },
  { value: 'OTHER', label: 'other', icon: CreditCard },
]

interface OrderOption {
  id: string
  customerName: string
  total: number
  status: string
}

interface PaymentFormProps {
  orderId?: string
}

export function PaymentForm({ orderId: defaultOrderId }: PaymentFormProps = {}) {
  const { t } = useTranslation()
  const { token } = useAuth()
  const { createPayment } = usePayments()
  const [open, setOpen] = useState(false)
  const [orderId, setOrderId] = useState(defaultOrderId || '')
  const [selectedOrder, setSelectedOrder] = useState<OrderOption | null>(null)
  const [orderSearch, setOrderSearch] = useState('')
  const [orders, setOrders] = useState<OrderOption[]>([])
  const [method, setMethod] = useState('CASH')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('COP')
  const [reference, setReference] = useState('')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)

  const searchOrders = useCallback(async (q: string) => {
    if (!token || q.length < 2) { setOrders([]); return }
    setSearching(true)
    try {
      const data = await api.get<OrderOption[]>(`/orders?search=${encodeURIComponent(q)}&limit=5`, token)
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      setOrders([])
    } finally {
      setSearching(false)
    }
  }, [token])

  const handleSelectOrder = (order: OrderOption) => {
    setSelectedOrder(order)
    setOrderId(order.id)
    setAmount(order.total.toString())
    setOrderSearch('')
    setOrders([])
  }

  const handleSubmit = async () => {
    if (!orderId || !amount) return
    
    setLoading(true)
    try {
      await createPayment({
        orderId,
        method,
        amount: parseFloat(amount),
        currency,
        reference: reference || undefined,
      })
      setOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error creating payment:', error)
      alert(t('error_payment'))
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setOrderId(defaultOrderId || '')
    setSelectedOrder(null)
    setOrderSearch('')
    setOrders([])
    setMethod('CASH')
    setAmount('')
    setCurrency('COP')
    setReference('')
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        {t('add_payment')}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('register_payment')}</DialogTitle>
            <DialogDescription>
              {t('payment_form_desc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('select_order')}</Label>
              {!selectedOrder ? (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('search_orders')}
                      value={orderSearch}
                      onChange={(e) => {
                        setOrderSearch(e.target.value)
                        searchOrders(e.target.value)
                      }}
                      className="pl-10"
                    />
                    {searching && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{t('searching')}...</span>}
                  </div>
                  {orders.length > 0 && (
                    <div className="border border-border rounded-lg divide-y divide-border max-h-48 overflow-y-auto">
                      {orders.map((order) => (
                        <button
                          key={order.id}
                          className="w-full px-4 py-3 text-left hover:bg-muted flex items-center justify-between text-sm"
                          onClick={() => handleSelectOrder(order)}
                        >
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{order.customerName || t('no_name')}</p>
                              <p className="text-xs text-muted-foreground">#{order.id.slice(-6).toUpperCase()}</p>
                            </div>
                          </div>
                          <span className="font-medium">{formatPrice(order.total)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{selectedOrder.customerName || t('no_name')}</p>
                      <p className="text-xs text-muted-foreground">#{selectedOrder.id.slice(-6).toUpperCase()} — {formatPrice(selectedOrder.total)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedOrder(null); setOrderId(''); setAmount('') }}>
                    {t('change')}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('method')}</Label>
              <div className="grid grid-cols-2 gap-2">
                {METHOD_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={method === opt.value ? 'default' : 'outline'}
                    className="justify-start"
                    onClick={() => setMethod(opt.value)}
                  >
                    <opt.icon className="h-4 w-4 mr-2" />
                    {t(opt.label)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('amount')}</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('currency')}</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COP">COP</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('reference_optional')}</Label>
              <Input
                placeholder={t('reference')}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !orderId || !amount}>
              {loading ? t('saving') + '...' : t('register_payment')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
