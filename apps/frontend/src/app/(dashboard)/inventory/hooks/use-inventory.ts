'use client'

import { useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'
import { useInventoryStore } from '../store/inventory-store'

export interface CatalogItem {
  id: string
  name: string
  sku: string | null
}

export interface Batch {
  id: string
  batchNumber: string
  quantity: number
  remainingQuantity: number
  costPerUnit: number | null
  receivedAt: string
  expiresAt: string | null
  supplier: string | null
  notes: string | null
  createdBy: string | null
}

export interface Movement {
  id: string
  type: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  reason: string | null
  createdBy: string | null
  createdAt: string
}

export interface InventoryItem {
  id: string
  quantity: number
  lowStockThreshold: number
  catalogItem: CatalogItem
}

export interface BatchInput {
  batchNumber: string
  quantity: number
  costPerUnit?: number
  expiresAt?: string
  supplier?: string
  notes?: string
}

export function useInventory() {
  const { token } = useAuth()
  const fetchItems = useCallback(async () => {
    if (!token) return
    useInventoryStore.getState().setLoading(true)
    try {
      const data = await api.get<InventoryItem[]>('/inventory', token)
      useInventoryStore.getState().setItems(data)
    } catch {
      useInventoryStore.getState().setItems([])
    } finally {
      useInventoryStore.getState().setLoading(false)
    }
  }, [token])

  const fetchDetail = useCallback(async (catalogItemId: string) => {
    if (!token) return
    useInventoryStore.getState().setDetailLoading(true)
    try {
      const [b, m] = await Promise.all([
        api.get<Batch[]>(`/inventory/${catalogItemId}/batches`, token),
        api.get<Movement[]>(`/inventory/${catalogItemId}/movements`, token),
      ])
      useInventoryStore.getState().setBatches(b || [])
      useInventoryStore.getState().setMovements(m || [])
    } catch {
      useInventoryStore.getState().setBatches([])
      useInventoryStore.getState().setMovements([])
    } finally {
      useInventoryStore.getState().setDetailLoading(false)
    }
  }, [token])

  const createBatch = useCallback(async (catalogItemId: string, input: BatchInput) => {
    if (!token) return
    await api.post(`/inventory/${catalogItemId}/batches`, input, token)
  }, [token])

  const selectItem = useCallback(async (item: InventoryItem) => {
    useInventoryStore.getState().setSelectedItem(item)
    useInventoryStore.getState().setDetailOpen(true)
    await fetchDetail(item.catalogItem.id)
  }, [fetchDetail])

  const submitBatch = useCallback(async (data: BatchInput) => {
    const { selectedItem } = useInventoryStore.getState()
    if (!selectedItem) return
    await createBatch(selectedItem.catalogItem.id, data)
    useInventoryStore.getState().setBatchFormOpen(false)
    await fetchDetail(selectedItem.catalogItem.id)
    fetchItems()
  }, [createBatch, fetchDetail, fetchItems])

  return {
    fetchItems,
    fetchDetail,
    createBatch,
    selectItem,
    submitBatch,
  }
}
