'use client'

import { create } from 'zustand'
import type { CatalogItem } from '@cms/shared'

interface CatalogState {
  items: CatalogItem[]
  selected: CatalogItem | null
  loading: boolean
  setItems: (items: CatalogItem[]) => void
  setSelected: (item: CatalogItem | null) => void
  setLoading: (loading: boolean) => void
  addItem: (item: CatalogItem) => void
  updateItem: (id: string, data: Partial<CatalogItem>) => void
  removeItem: (id: string) => void
}

export const useCatalogStore = create<CatalogState>((set) => ({
  items: [],
  selected: null,
  loading: false,
  setItems: (items) => set({ items }),
  setSelected: (selected) => set({ selected }),
  setLoading: (loading) => set({ loading }),
  addItem: (item) => set((s) => ({ items: [item, ...s.items] })),
  updateItem: (id, data) =>
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, ...data } : i)),
    })),
  removeItem: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
}))
