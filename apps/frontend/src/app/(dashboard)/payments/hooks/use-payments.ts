'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'

export interface Payment {
  id: string
  orderId: string
  method: string
  status: string
  amount: number
  currency: string
  reference?: string
  externalId?: string
  paidAt?: string
  refundedAt?: string
  failureReason?: string
  createdAt: string
  updatedAt: string
  order?: {
    id: string
    customerName: string
    total: number
    status: string
  }
}

export interface PaymentStats {
  totalPayments: number
  totalPaid: number
  totalRefunded: number
  totalPending: number
}

export function usePayments() {
  const { token } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<PaymentStats>({
    totalPayments: 0,
    totalPaid: 0,
    totalRefunded: 0,
    totalPending: 0,
  })

  const fetchPayments = useCallback(async (filters?: { status?: string; method?: string }) => {
    if (!token) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.method) params.append('method', filters.method)
      
      const qs = params.toString()
      const data = await api.get<Payment[]>(`/payments${qs ? '?' + qs : ''}`, token)
      setPayments(data)
    } catch {
      setPayments([])
    } finally {
      setLoading(false)
    }
  }, [token])

  const fetchStats = useCallback(async () => {
    if (!token) return
    try {
      const data = await api.get<PaymentStats>('/payments/stats', token)
      setStats(data)
    } catch {
      // ignore
    }
  }, [token])

  const updateStatus = useCallback(async (id: string, status: string) => {
    if (!token) return
    await api.put(`/payments/${id}/status`, { status }, token)
  }, [token])

  const refund = useCallback(async (id: string, amount: number) => {
    if (!token) return
    await api.put(`/payments/${id}/refund`, { amount }, token)
  }, [token])

  return {
    payments,
    loading,
    stats,
    fetchPayments,
    fetchStats,
    updateStatus,
    refund,
  }
}
