'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'

interface DeliveryStats {
  total: number
  assigned: number
  inProgress: number
  completed: number
  failed: number
  successRate: number
  avgTimeMinutes: number
}

interface DriverStats {
  totalDrivers: number
  activeDrivers: number
  totalDeliveries: number
  totalCompleted: number
  totalFailed: number
  avgDeliveryTime: number
  successRate: number
}

interface ReturnsStats {
  total: number
  pending: number
  inTransit: number
  received: number
  refunded: number
}

export function useReports() {
  const { token } = useAuth()
  const [deliveryStats, setDeliveryStats] = useState<DeliveryStats | null>(null)
  const [driverStats, setDriverStats] = useState<DriverStats | null>(null)
  const [returnsStats, setReturnsStats] = useState<ReturnsStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [deliveries, drivers, returns] = await Promise.all([
        api.get<DeliveryStats>('/deliveries/stats', token),
        api.get<DriverStats>('/drivers/stats', token),
        api.get<ReturnsStats>('/returns/stats', token),
      ])
      setDeliveryStats(deliveries)
      setDriverStats(drivers)
      setReturnsStats(returns)
    } catch (err) {
      console.error('Failed to fetch reports:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    deliveryStats,
    driverStats,
    returnsStats,
    loading,
    fetchStats,
  }
}
