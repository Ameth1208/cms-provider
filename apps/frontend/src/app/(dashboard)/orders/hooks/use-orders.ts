'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'
import type { Order } from '@cms/shared'

export function useOrders() {
  const { token } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  const fetchOrders = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await api.get<Order[]>('/orders', token)
      setOrders(data)
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [token])

  const updateStatus = useCallback(async (id: string, status: string) => {
    if (!token) return
    const updated = await api.put<Order>(`/orders/${id}`, { status }, token)
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)))
  }, [token])

  const updateOrder = useCallback(async (id: string, data: Partial<Order>) => {
    if (!token) return
    const updated = await api.put<Order>(`/orders/${id}`, data, token)
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)))
    return updated
  }, [token])

  return { orders, loading, fetchOrders, updateStatus, updateOrder }
}
