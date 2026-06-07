'use client'

import { useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'
import { useOrdersStore } from '../store/orders-store'

export interface OrderItem {
  id: string
  catalogItemId: string
  catalogItemName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Order {
  id: string
  status: string
  paymentStatus: string
  shippingStatus: string
  subtotal: number
  discount: number
  tax: number
  shippingCost: number
  total: number
  overpaidAmount: number
  cancelledAt?: string
  cancellationReason?: string
  refundedAmount: number
  customerId?: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  customer?: {
    id: string
    name: string
    email: string
    phone?: string
  }
  shippingAddress?: string
  shippingCity?: string
  shippingState?: string
  shippingZip?: string
  shippingCountry?: string
  shippingMethodId?: string
  shippingMethod?: {
    id: string
    name: string
    price: number
  }
  carrier?: string
  trackingNumber?: string
  shippedAt?: string
  deliveredAt?: string
  notes?: string
  internalNotes?: string
  couponCode?: string
  items: OrderItem[]
  payments?: {
    id: string
    status: string
    amount: number
    method: string
    createdAt: string
  }[]
  driver?: { id: string; name: string; phone?: string }
  delivery?: {
    status: string
    trackingEvents?: { id: string; status: string; timestamp: string; address?: string }[]
  }
  deliveryInstructions?: string
  proofOfDelivery?: string
  createdAt: string
  updatedAt: string
}

export interface CreateOrderData {
  customerId?: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  shippingMethodId?: string
  shippingAddress?: string
  shippingCity?: string
  shippingState?: string
  shippingZip?: string
  shippingCountry?: string
  notes?: string
  internalNotes?: string
  items: { catalogItemId: string; quantity: number }[]
  couponCode?: string
}

export function useOrders() {
  const { token } = useAuth()
  const { setOrders, setLoading, setStats, setTotalOrders, updateOrder: updateOrderInStore } = useOrdersStore()

  const fetchOrders = useCallback(async (filters?: { status?: string; paymentStatus?: string; customerId?: string; search?: string; from?: string; to?: string; page?: number; pageSize?: number }) => {
    if (!token) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus)
      if (filters?.customerId) params.append('customerId', filters.customerId)
      if (filters?.search) params.append('search', filters.search)
      if (filters?.from) params.append('from', filters.from)
      if (filters?.to) params.append('to', filters.to)
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString())
      
      const qs = params.toString()
      const data = await api.get<{ orders: Order[]; total: number }>(`/orders${qs ? '?' + qs : ''}`, token)
      setOrders(data.orders)
      setTotalOrders(data.total)
    } catch (err) {
      console.error('Error fetching orders:', err)
      setOrders([])
      setTotalOrders(0)
    } finally {
      setLoading(false)
    }
  }, [token, setOrders, setLoading, setTotalOrders])

  const fetchStats = useCallback(async () => {
    if (!token) return
    try {
      const data = await api.get<{
        totalOrders: number
        pendingOrders: number
        processingOrders: number
        shippedOrders: number
        deliveredOrders: number
        totalRevenue: number
      }>('/orders/stats', token)
      setStats(data)
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }, [token, setStats])

  const createOrder = useCallback(async (data: CreateOrderData) => {
    if (!token) return null
    const order = await api.post<Order>('/orders', data, token)
    const currentOrders = useOrdersStore.getState().orders
    setOrders([order, ...currentOrders])
    return order
  }, [token, setOrders])

  const updateStatus = useCallback(async (id: string, status: string) => {
    if (!token) return
    const updated = await api.post<Order>(`/orders/${id}/status`, { status }, token)
    updateOrderInStore(updated)
  }, [token, updateOrderInStore])

  const updateShippingStatus = useCallback(async (id: string, shippingStatus: string, carrier?: string, trackingNumber?: string) => {
    if (!token) return
    const data: any = { shippingStatus }
    if (carrier) data.carrier = carrier
    if (trackingNumber) data.trackingNumber = trackingNumber
    const updated = await api.put<Order>(`/orders/${id}`, data, token)
    updateOrderInStore(updated)
  }, [token, updateOrderInStore])

  const updateOrder = useCallback(async (id: string, data: Partial<Order>) => {
    if (!token) return
    const updated = await api.put<Order>(`/orders/${id}`, data, token)
    updateOrderInStore(updated)
    return updated
  }, [token, updateOrderInStore])

  const addOrderItem = useCallback(async (orderId: string, item: { catalogItemId: string; quantity: number }) => {
    if (!token) return
    const updated = await api.post<Order>(`/orders/${orderId}/items`, item, token)
    updateOrderInStore(updated)
    return updated
  }, [token, updateOrderInStore])

  const removeOrderItem = useCallback(async (orderId: string, itemId: string) => {
    if (!token) return
    const updated = await api.delete<Order>(`/orders/${orderId}/items/${itemId}`, token)
    updateOrderInStore(updated)
    return updated
  }, [token, updateOrderInStore])

  const searchCustomers = useCallback(async (q: string) => {
    if (!token) return []
    try {
      const qs = q.length >= 2 ? `?search=${encodeURIComponent(q)}` : ''
      return await api.get<{ id: string; name: string; email: string; phone?: string }[]>(`/customers${qs}`, token)
    } catch {
      return []
    }
  }, [token])

  const searchProducts = useCallback(async (q: string) => {
    if (!token) return []
    try {
      const qs = q.length >= 2 ? `?search=${encodeURIComponent(q)}&type=PRODUCT` : '?type=PRODUCT'
      return await api.get<{ id: string; name: string; price: number; sku?: string; media?: { url: string }[] }[]>(`/catalog${qs}`, token)
    } catch {
      return []
    }
  }, [token])

  const addPayment = useCallback(async (id: string, data: { method: string; amount: number; reference?: string }) => {
    if (!token) return null
    try {
      const updated = await api.post<Order>(`/orders/${id}/payments`, data, token)
      if (updated) {
        updateOrderInStore(updated)
        return updated
      }
      return null
    } catch (error) {
      console.error('Error adding payment:', error)
      throw error
    }
  }, [token, updateOrderInStore])

  const cancelOrder = useCallback(async (id: string, data: { reason?: string }) => {
    if (!token) return null
    try {
      const updated = await api.post<Order>(`/orders/${id}/cancel`, data, token)
      if (updated) {
        updateOrderInStore(updated)
        return updated
      }
      return null
    } catch (error) {
      console.error('Error cancelling order:', error)
      throw error
    }
  }, [token, updateOrderInStore])

  return {
    fetchOrders,
    fetchStats,
    createOrder,
    updateStatus,
    updateShippingStatus,
    updateOrder,
    addOrderItem,
    removeOrderItem,
    addPayment,
    cancelOrder,
    searchCustomers,
    searchProducts,
  }
}
