'use client'

import { create } from 'zustand'
import { api } from '@/lib/api-client'
import type { ThemeSettings } from '@cms/shared'

interface SettingsState {
  settings: ThemeSettings
  loading: boolean
  fetchSettings: (token: string) => Promise<void>
  saveSettings: (token: string, data: Partial<ThemeSettings>) => Promise<void>
  updateField: (key: keyof ThemeSettings, value: string | null) => void
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {
    companyName: '',
    primaryColor: '#000000',
    secondaryColor: '#f1f5f9',
    accentColor: '#f1f5f9',
    fontFamily: 'var(--font-poppins)',
    logoUrl: null,
  },
  loading: false,

  fetchSettings: async (token) => {
    set({ loading: true })
    try {
      const settings = await api.get<ThemeSettings>('/settings', token)
      set({ settings, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  saveSettings: async (token, data) => {
    const updated = await api.put<ThemeSettings>('/settings', data, token)
    set({ settings: updated })
  },

  updateField: (key, value) => {
    set((s) => ({ settings: { ...s.settings, [key]: value } }))
  },
}))
