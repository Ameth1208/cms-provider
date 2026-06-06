'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'

export interface DeliveryWithOrder {
  id: string
  status: string
  order: {
    id: string
    customerName: string
    customerPhone?: string
    shippingAddress?: string
    shippingCity?: string
    total: number
    items: { catalogItemName: string; quantity: number }[]
  }
}

export function useDriverDashboard() {
  const { token } = useAuth()
  const [deliveries, setDeliveries] = useState<DeliveryWithOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const fetchDeliveries = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await api.get<DeliveryWithOrder[]>('/deliveries/my-orders', token)
      setDeliveries(data)
    } catch (err) {
      console.error('Failed to fetch deliveries:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchDeliveries()
    const interval = setInterval(fetchDeliveries, 30000)
    return () => clearInterval(interval)
  }, [fetchDeliveries])

  const updateStatus = async (deliveryId: string, status: string, failureReason?: string) => {
    if (!token) return
    setUpdating(true)
    try {
      await api.put(`/deliveries/${deliveryId}/status`, { status, failureReason }, token)

      if (status === 'COMPLETED') {
        try {
          const position = await getCurrentPosition()
          await api.post(`/deliveries/${deliveryId}/tracking`, {
            status: 'COMPLETED',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }, token)
        } catch {
          // GPS not available
        }
      }

      await fetchDeliveries()
    } finally {
      setUpdating(false)
    }
  }

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
      })
    })
  }

  const pendingDeliveries = deliveries.filter((d) => d.status !== 'COMPLETED' && d.status !== 'FAILED')
  const completedToday = deliveries.filter((d) => d.status === 'COMPLETED')

  return {
    deliveries,
    pendingDeliveries,
    completedToday,
    loading,
    updating,
    updateStatus,
    fetchDeliveries,
  }
}
