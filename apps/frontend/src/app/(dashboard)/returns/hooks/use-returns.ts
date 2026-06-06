'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'

export interface Return {
  id: string
  orderId: string
  orderItemId?: string
  status: string
  reason: string
  reasonDetails?: string
  photos: string[]
  quantity: number
  refundAmount?: number
  receivedAt?: string
  receivedBy?: string
  condition?: string
  resolution?: string
  resolutionNotes?: string
  resolvedAt?: string
  pickupAddress?: string
  pickupScheduledAt?: string
  pickupCompletedAt?: string
  pickupDriverId?: string
  createdAt: string
  order?: {
    id: string
    customerName: string
    total: number
    status: string
  }
  pickupDriver?: {
    id: string
    name: string
    phone: string
  }
}

export function useReturns() {
  const { token } = useAuth()
  const [returns, setReturns] = useState<Return[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inTransit: 0,
    received: 0,
    refunded: 0,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchReturns = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [data, statsData] = await Promise.all([
        api.get<Return[]>('/returns', token),
        api.get<typeof stats>('/returns/stats', token),
      ])
      setReturns(data)
      setStats(statsData)
    } catch (err) {
      console.error('Failed to fetch returns:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchReturns()
  }, [fetchReturns])

  const createReturn = async (data: {
    orderId: string
    orderItemId?: string
    reason: string
    reasonDetails?: string
    photos?: string[]
    quantity?: number
    refundAmount?: number
    pickupAddress?: string
  }) => {
    if (!token) return
    setSaving(true)
    try {
      await api.post('/returns', data, token)
      await fetchReturns()
    } finally {
      setSaving(false)
    }
  }

  const updateReturn = async (id: string, data: Partial<Return>) => {
    if (!token) return
    setSaving(true)
    try {
      await api.put(`/returns/${id}`, data, token)
      await fetchReturns()
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (id: string, status: string, notes?: string) => {
    if (!token) return
    await api.put(`/returns/${id}/status`, { status, notes }, token)
    await fetchReturns()
  }

  const deleteReturn = async (id: string) => {
    if (!token) return
    await api.delete(`/returns/${id}`, token)
    await fetchReturns()
  }

  return {
    returns,
    stats,
    loading,
    saving,
    fetchReturns,
    createReturn,
    updateReturn,
    updateStatus,
    deleteReturn,
  }
}
