'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'
import type { ThemeSettings } from '@cms/shared'

export function useSettings() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ThemeSettings>({
    companyName: '',
    primaryColor: '#000000',
    secondaryColor: '#f1f5f9',
    accentColor: '#f1f5f9',
    fontFamily: 'var(--font-poppins)',
    logoUrl: null,
  })

  useEffect(() => {
    if (!token) return
    api.get<ThemeSettings>('/settings', token)
      .then((data) => setForm(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  const handleChange = useCallback((key: keyof ThemeSettings, value: string | null) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleSave = useCallback(async () => {
    if (!token) return
    setSaving(true)
    try {
      const updated = await api.put<ThemeSettings>('/settings', form, token)
      setForm(updated)
    } finally {
      setSaving(false)
    }
  }, [token, form])

  return { form, loading, saving, handleChange, handleSave }
}
