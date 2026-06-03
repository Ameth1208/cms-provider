'use client'

import { create } from 'zustand'
import type { InventoryItem, Batch, Movement } from '../hooks/use-inventory'

interface InventoryState {
  items: InventoryItem[]
  batches: Batch[]
  movements: Movement[]
  loading: boolean
  detailLoading: boolean
  selectedItem: InventoryItem | null
  detailOpen: boolean
  batchFormOpen: boolean

  setItems: (items: InventoryItem[]) => void
  setBatches: (batches: Batch[]) => void
  setMovements: (movements: Movement[]) => void
  setLoading: (loading: boolean) => void
  setDetailLoading: (loading: boolean) => void
  setSelectedItem: (item: InventoryItem | null) => void
  setDetailOpen: (open: boolean) => void
  setBatchFormOpen: (open: boolean) => void
}

export const useInventoryStore = create<InventoryState>((set) => ({
  items: [],
  batches: [],
  movements: [],
  loading: false,
  detailLoading: false,
  selectedItem: null,
  detailOpen: false,
  batchFormOpen: false,

  setItems: (items) => set({ items }),
  setBatches: (batches) => set({ batches }),
  setMovements: (movements) => set({ movements }),
  setLoading: (loading) => set({ loading }),
  setDetailLoading: (detailLoading) => set({ detailLoading }),
  setSelectedItem: (selectedItem) => set({ selectedItem }),
  setDetailOpen: (detailOpen) => set({ detailOpen }),
  setBatchFormOpen: (batchFormOpen) => set({ batchFormOpen }),
}))
