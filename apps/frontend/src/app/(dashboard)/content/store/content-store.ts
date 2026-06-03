'use client'

import { create } from 'zustand'

interface ContentState {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const useContentStore = create<ContentState>((set) => ({
  activeTab: 'preview',
  setActiveTab: (activeTab) => set({ activeTab }),
}))
