'use client'

import { create } from 'zustand'

type Locale = 'es' | 'en'

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: (typeof document !== 'undefined' ? navigator.language.startsWith('en') ? 'en' : 'es' : 'es') as Locale,
  setLocale: (locale) => set({ locale }),
}))
