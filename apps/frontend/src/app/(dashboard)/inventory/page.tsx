'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'

export default function InventoryPage() {
  const { token } = useAuth()
  const [inventory, setInventory] = useState<any[]>([])
  const [lowStock, setLowStock] = useState<any[]>([])

  useEffect(() => {
    if (!token) return
    api.get<any[]>('/inventory', token).then(setInventory)
    api.get<any[]>('/inventory/low-stock', token).then(setLowStock)
  }, [token])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Inventario</h1>

      {lowStock.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <h2 className="font-semibold text-red-700 text-sm mb-2">
            ⚠️ Sin stock ({lowStock.length})
          </h2>
          {lowStock.map((i: any) => (
            <p key={i.id} className="text-sm text-red-600">
              {i.catalogItem.name} ({i.catalogItem.sku}) — {i.quantity} unidades
            </p>
          ))}
        </div>
      )}

      <div className="bg-background rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3">Item</th>
              <th className="text-left px-4 py-3">SKU</th>
              <th className="text-left px-4 py-3">Stock</th>
              <th className="text-left px-4 py-3">Min. sugerido</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((inv: any) => (
              <tr key={inv.id} className="border-b hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{inv.catalogItem.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.catalogItem.sku || '—'}</td>
                <td className="px-4 py-3">
                  <span className={inv.quantity <= 0 ? 'text-red-600 font-medium' : ''}>
                    {inv.quantity}
                  </span>
                </td>
                <td className="px-4 py-3">{inv.lowStockThreshold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
