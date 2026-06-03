'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'
import { useOrdersStore } from './store/orders-store'
import { getSocket } from '@/lib/socket'

export default function OrdersPage() {
  const { token, user } = useAuth()
  const orgId = user?.organizationId
  const { orders, setOrders, addOrder, updateOrderStatus } = useOrdersStore()

  useEffect(() => {
    if (!token) return
    api.get<any[]>('/orders', token).then(setOrders)
  }, [token, setOrders])

  useEffect(() => {
    if (!token || !orgId) return
    const socket = getSocket(token, orgId)

    socket.on('order.created', (order: any) => addOrder(order))
    socket.on('order.status', (order: any) => updateOrderStatus(order.id, order.status))

    return () => { socket.off('order.created'); socket.off('order.status') }
  }, [token, orgId, addOrder, updateOrderStatus])

  const statusColor: Record<string, string> = {
    PENDING: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    CONFIRMED: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400',
    PROCESSING: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    SHIPPED: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
    DELIVERED: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    CANCELLED: 'bg-red-500/15 text-red-600 dark:text-red-400',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pedidos</h1>

      <div className="bg-background rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3">Cliente</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Total</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{order.customerName}</td>
                <td className="px-4 py-3 text-muted-foreground">{order.customerEmail}</td>
                <td className="px-4 py-3">${order.total.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[order.status] || 'bg-muted'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No hay pedidos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
