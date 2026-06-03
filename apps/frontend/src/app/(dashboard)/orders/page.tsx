'use client'

import { useEffect } from 'react'
import { useOrders } from './hooks/use-orders'
import { OrdersTable } from './components/orders-table'

export default function OrdersPage() {
  const { fetchOrders } = useOrders()

  useEffect(() => { fetchOrders() }, [fetchOrders])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Órdenes</h1>
        <p className="text-sm text-muted-foreground font-light mt-1">Gestión de pedidos y envíos</p>
      </div>
      <OrdersTable />
    </div>
  )
}
