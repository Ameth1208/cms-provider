'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useSettingsStore } from '@/store'
import { api } from '@/lib/api-client'

export function useSettings() {
  const { token } = useAuth()
  const { settings, loading, fetchSettings, saveSettings, updateField } = useSettingsStore()

  useEffect(() => {
    if (!token) return
    fetchSettings(token)
  }, [token, fetchSettings])

  const handleChange = (key: keyof typeof settings, value: string | null) => {
    updateField(key, value)
  }

  const handleSave = async () => {
    if (!token) return
    await saveSettings(token, settings)
  }

  const uploadLogo = async (file: File) => {
    if (!token) throw new Error('No token')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'logos')
    const { url } = await api.upload<{ url: string }>('/media/upload', formData, token)
    return url
  }

  return { form: settings, loading, saving: loading, handleChange, handleSave, uploadLogo }
}
