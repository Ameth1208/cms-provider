'use client'

import { create } from 'zustand'
import type { CatalogItem } from '@cms/shared'
import type { Category, Tag } from '@cms/shared'

interface CatalogState {
  items: CatalogItem[]
  selected: CatalogItem | null
  loading: boolean

  categories: Category[]
  tags: Tag[]

  // Filters
  search: string
  filterType: 'ALL' | 'PRODUCT' | 'SERVICE'
  filterStatus: 'ALL' | 'ACTIVE' | 'INACTIVE'
  filterCategory: string
  filterTag: string

  setItems: (items: CatalogItem[]) => void
  setSelected: (item: CatalogItem | null) => void
  setLoading: (loading: boolean) => void
  addItem: (item: CatalogItem) => void
  updateItem: (id: string, data: Partial<CatalogItem>) => void
  removeItem: (id: string) => void

  setCategories: (categories: Category[]) => void
  setTags: (tags: Tag[]) => void

  setSearch: (search: string) => void
  setFilterType: (type: 'ALL' | 'PRODUCT' | 'SERVICE') => void
  setFilterStatus: (status: 'ALL' | 'ACTIVE' | 'INACTIVE') => void
  setFilterCategory: (id: string) => void
  setFilterTag: (id: string) => void
  clearFilters: () => void
}

export const useCatalogStore = create<CatalogState>((set) => ({
  items: [],
  selected: null,
  loading: false,

  categories: [],
  tags: [],

  search: '',
  filterType: 'ALL',
  filterStatus: 'ALL',
  filterCategory: 'ALL',
  filterTag: 'ALL',

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

  setCategories: (categories) => set({ categories }),
  setTags: (tags) => set({ tags }),

  setSearch: (search) => set({ search }),
  setFilterType: (filterType) => set({ filterType }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setFilterCategory: (filterCategory) => set({ filterCategory }),
  setFilterTag: (filterTag) => set({ filterTag }),
  clearFilters: () =>
    set({
      search: '',
      filterType: 'ALL',
      filterStatus: 'ALL',
      filterCategory: 'ALL',
      filterTag: 'ALL',
    }),
}))
