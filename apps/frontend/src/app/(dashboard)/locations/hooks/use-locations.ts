'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'

export interface Location {
  id: string
  name: string
  address: string
  city?: string
  state?: string
  zip?: string
  country?: string
  phone?: string
  email?: string
  latitude?: number
  longitude?: number
  isMain: boolean
  active: boolean
}

export function useLocations() {
  const { token } = useAuth()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchLocations = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await api.get<Location[]>('/locations', token)
      setLocations(data)
    } catch (err) {
      console.error('Failed to fetch locations:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  const createLocation = async (data: Omit<Location, 'id' | 'active'>) => {
    if (!token) return
    setSaving(true)
    try {
      await api.post('/locations', data, token)
      await fetchLocations()
    } finally {
      setSaving(false)
    }
  }

  const updateLocation = async (id: string, data: Partial<Location>) => {
    if (!token) return
    setSaving(true)
    try {
      await api.put(`/locations/${id}`, data, token)
      await fetchLocations()
    } finally {
      setSaving(false)
    }
  }

  const deleteLocation = async (id: string) => {
    if (!token) return
    await api.delete(`/locations/${id}`, token)
    await fetchLocations()
  }

  return {
    locations,
    loading,
    saving,
    fetchLocations,
    createLocation,
    updateLocation,
    deleteLocation,
  }
}
