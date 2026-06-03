'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'
import type { Campaign } from '@cms/shared'

export function useCampaigns() {
  const { token } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCampaigns = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await api.get<Campaign[]>('/campaigns', token)
      setCampaigns(data)
    } catch {
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }, [token])

  const toggleActive = useCallback(async (id: string) => {
    if (!token) return
    const updated = await api.post<Campaign>(`/campaigns/${id}/toggle`, {}, token)
    setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)))
  }, [token])

  return { campaigns, loading, fetchCampaigns, toggleActive }
}
