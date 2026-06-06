'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'

export interface Zone {
  id: string
  name: string
  coordinates: string
  shippingCost: number
  estimatedDays: number
  color: string
  active: boolean
}

export function useZones() {
  const { token } = useAuth()
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchZones = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await api.get<Zone[]>('/delivery-zones', token)
      setZones(data)
    } catch (err) {
      console.error('Failed to fetch zones:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchZones()
  }, [fetchZones])

  const createZone = async (data: Omit<Zone, 'id' | 'active'>) => {
    if (!token) return
    setSaving(true)
    try {
      await api.post('/delivery-zones', data, token)
      await fetchZones()
    } finally {
      setSaving(false)
    }
  }

  const deleteZone = async (id: string) => {
    if (!token) return
    await api.delete(`/delivery-zones/${id}`, token)
    await fetchZones()
  }

  return {
    zones,
    loading,
    saving,
    fetchZones,
    createZone,
    deleteZone,
  }
}
