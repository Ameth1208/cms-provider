'use client'

import { useState } from 'react'
import { Package, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTranslation } from '@/i18n/use-translation'
import { formatPrice } from '@/lib/utils'
import { useOrders } from '../hooks/use-orders'
import type { Order } from '../hooks/use-orders'

interface OrderItemsProps {
  order: Order
}

export function OrderItems({ order }: OrderItemsProps) {
  const { t } = useTranslation()
  const { addOrderItem, removeOrderItem, searchProducts } = useOrders()
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<any[]>([])

  const handleSearch = async (q: string) => {
    setSearch(q)
    if (q.length < 2) { setProducts([]); return }
    setProducts(await searchProducts(q))
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('search_products')}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {products.length > 0 && (
        <div className="border border-border rounded-lg divide-y divide-border">
          {products.map((p) => (
            <button
              key={p.id}
              className="w-full px-4 py-3 text-left hover:bg-muted flex justify-between text-sm"
              onClick={() => { addOrderItem(order.id, { catalogItemId: p.id, quantity: 1 }); setSearch(''); setProducts([]) }}
            >
              <span className="font-medium">{p.name}</span>
              <span className="flex items-center gap-2">
                <span>{formatPrice(p.price)}</span>
                <Plus className="h-4 w-4 text-primary" />
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {order.items.map((i) => (
          <div key={i.id} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{i.catalogItemName}</p>
                <p className="text-xs text-muted-foreground">{formatPrice(i.unitPrice)} x {i.quantity}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{formatPrice(i.totalPrice)}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive"
                onClick={() => removeOrderItem(order.id, i.id)}
              >
                <span className="text-xs">✕</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
