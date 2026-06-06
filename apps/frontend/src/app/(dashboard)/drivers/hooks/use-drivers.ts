'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'

export interface Driver {
  id: string
  name: string
  email?: string
  phone: string
  licenseNumber?: string
  vehicleType?: string
  licensePlate?: string
  active: boolean
  currentLat?: number
  currentLng?: number
  lastLocationAt?: string
  userId?: string
  user?: { id: string; email: string; name?: string }
  _count?: { orders: number; deliveries: number }
}

export function useDrivers() {
  const { token } = useAuth()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchDrivers = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await api.get<Driver[]>('/drivers', token)
      setDrivers(data)
    } catch (err) {
      console.error('Failed to fetch drivers:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchDrivers()
  }, [fetchDrivers])

  const createDriver = async (data: Omit<Driver, 'id' | '_count' | 'user'>) => {
    if (!token) return
    setSaving(true)
    try {
      await api.post('/drivers', data, token)
      await fetchDrivers()
    } finally {
      setSaving(false)
    }
  }

  const updateDriver = async (id: string, data: Partial<Driver>) => {
    if (!token) return
    setSaving(true)
    try {
      await api.put(`/drivers/${id}`, data, token)
      await fetchDrivers()
    } finally {
      setSaving(false)
    }
  }

  const deleteDriver = async (id: string) => {
    if (!token) return
    await api.delete(`/drivers/${id}`, token)
    await fetchDrivers()
  }

  return {
    drivers,
    loading,
    saving,
    fetchDrivers,
    createDriver,
    updateDriver,
    deleteDriver,
  }
}
