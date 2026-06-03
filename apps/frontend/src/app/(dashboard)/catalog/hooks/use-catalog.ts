'use client'

import { useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'
import { useCatalogStore } from '../store/catalog-store'

export function useCatalog() {
  const { token } = useAuth()
  const { items, loading, setItems, setLoading, addItem, updateItem, removeItem } = useCatalogStore()

  const fetchItems = useCallback(async (params?: Record<string, string>) => {
    if (!token) return
    setLoading(true)
    try {
      const qs = params ? '?' + new URLSearchParams(params).toString() : ''
      const data = await api.get<any[]>(`/catalog${qs}`, token)
      setItems(data)
    } finally {
      setLoading(false)
    }
  }, [token, setItems, setLoading])

  const createItem = useCallback(async (body: any) => {
    if (!token) return
    const item = await api.post('/catalog', body, token)
    addItem(item)
    return item
  }, [token, addItem])

  const editItem = useCallback(async (id: string, body: any) => {
    if (!token) return
    const item = await api.put(`/catalog/${id}`, body, token)
    updateItem(id, item)
    return item
  }, [token, updateItem])

  const deleteItem = useCallback(async (id: string) => {
    if (!token) return
    await api.delete(`/catalog/${id}`, token)
    removeItem(id)
  }, [token, removeItem])

  return { items, loading, fetchItems, createItem, editItem, deleteItem }
}
