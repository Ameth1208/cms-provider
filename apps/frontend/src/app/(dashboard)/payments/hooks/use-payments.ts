'use client'

import { useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'
import { usePaymentsStore } from '../store/payments-store'
import type { Payment, PaymentStats } from '../store/payments-store'

export { type Payment, type PaymentStats }

export function usePayments() {
  const { token } = useAuth()
  const { setPayments, addPayment: addToStore, updatePayment: updateInStore, setLoading, setStats } = usePaymentsStore()

  const fetchPayments = useCallback(async (filters?: { status?: string; method?: string }) => {
    if (!token) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.method) params.append('method', filters.method)
      
      const qs = params.toString()
      const data = await api.get<Payment[]>(`/payments${qs ? '?' + qs : ''}`, token)
      
      if (Array.isArray(data)) {
        setPayments(data)
      } else {
        console.error('Payments response is not an array:', data)
        setPayments([])
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
      setPayments([])
    } finally {
      setLoading(false)
    }
  }, [token, setPayments, setLoading])

  const fetchStats = useCallback(async () => {
    if (!token) return
    try {
      const data = await api.get<PaymentStats>('/payments/stats', token)
      setStats(data)
    } catch {
      // ignore
    }
  }, [token, setStats])

  const updateStatus = useCallback(async (id: string, status: string) => {
    if (!token) return
    try {
      const updated = await api.put<Payment>(`/payments/${id}/status`, { status }, token)
      updateInStore(updated)
    } catch (error) {
      console.error('Error updating payment status:', error)
    }
  }, [token, updateInStore])

  const refund = useCallback(async (id: string, amount: number) => {
    if (!token) return
    try {
      const updated = await api.put<Payment>(`/payments/${id}/refund`, { amount }, token)
      updateInStore(updated)
    } catch (error) {
      console.error('Error refunding payment:', error)
    }
  }, [token, updateInStore])

  const createPayment = useCallback(async (data: {
    orderId: string
    method: string
    amount: number
    currency?: string
    reference?: string
  }) => {
    if (!token) return null
    try {
      const payment = await api.post<Payment>('/payments', data, token)
      addToStore(payment)
      return payment
    } catch (error) {
      console.error('Error creating payment:', error)
      throw error
    }
  }, [token, addToStore])

  return {
    fetchPayments,
    fetchStats,
    updateStatus,
    refund,
    createPayment,
  }
}
