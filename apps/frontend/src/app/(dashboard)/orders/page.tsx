'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api-client'
import { useOrdersStore } from './store/orders-store'
import { getSocket } from '@/lib/socket'

export default function OrdersPage() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken
  const orgId = (session?.user as any)?.organizationId
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
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-purple-100 text-purple-700',
    SHIPPED: 'bg-cyan-100 text-cyan-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
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
