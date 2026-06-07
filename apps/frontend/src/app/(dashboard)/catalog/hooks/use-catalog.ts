'use client'

import { useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'
import { useCatalogStore } from '../store/catalog-store'

export function useCatalog() {
  const { token } = useAuth()
  const items = useCatalogStore((s) => s.items)
  const loading = useCatalogStore((s) => s.loading)

  const fetchItems = useCallback(async (params?: Record<string, string>) => {
    if (!token) return
    useCatalogStore.getState().setLoading(true)
    try {
      const qs = params ? '?' + new URLSearchParams(params).toString() : ''
      const data = await api.get<any[]>(`/catalog${qs}`, token)
      useCatalogStore.getState().setItems(data)
    } finally {
      useCatalogStore.getState().setLoading(false)
    }
  }, [token])

  const createItem = useCallback(async (body: any) => {
    if (!token) return
    const item = await api.post('/catalog', body, token)
    useCatalogStore.getState().addItem(item)
    return item
  }, [token])

  const editItem = useCallback(async (id: string, body: any) => {
    if (!token) return
    const item = await api.put(`/catalog/${id}`, body, token)
    useCatalogStore.getState().updateItem(id, item)
    return item
  }, [token])

  const deleteItem = useCallback(async (id: string) => {
    if (!token) return
    try {
      await api.delete(`/catalog/${id}`, token)
      useCatalogStore.getState().removeItem(id)
      // Force refresh to ensure UI sync
      const state = useCatalogStore.getState()
      const params: Record<string, string> = {}
      if (state.search) params.search = state.search
      if (state.filterType !== 'ALL') params.type = state.filterType
      if (state.filterCategory !== 'ALL') params.categoryId = state.filterCategory
      if (state.filterTag !== 'ALL') params.tagId = state.filterTag
      const qs = Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : ''
      const data = await api.get<any[]>(`/catalog${qs}`, token)
      useCatalogStore.getState().setItems(data)
    } catch (err) {
      console.error('Failed to delete item:', err)
      throw err
    }
  }, [token])

  return { items, loading, fetchItems, createItem, editItem, deleteItem }
}
