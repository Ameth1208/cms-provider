'use client'

import { useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'
import { useApiKeysStore, type ApiKeyRecord } from '../store/api-keys-store'

export function useApiKeys() {
  const { token } = useAuth()

  const keys = useApiKeysStore((s) => s.keys)
  const loading = useApiKeysStore((s) => s.loading)
  const selected = useApiKeysStore((s) => s.selected)

  const fetchKeys = useCallback(async () => {
    if (!token) return
    useApiKeysStore.getState().setLoading(true)
    try {
      const data = await api.get<ApiKeyRecord[]>('/api-keys', token)
      useApiKeysStore.getState().setKeys(data)
    } catch {
      useApiKeysStore.getState().setKeys([])
    } finally {
      useApiKeysStore.getState().setLoading(false)
    }
  }, [token])

  const createKey = useCallback(async (name: string, permissions: string[]) => {
    if (!token || !name.trim()) return
    const data = await api.post<ApiKeyRecord>('/api-keys', { name: name.trim(), permissions }, token)
    useApiKeysStore.getState().setNewKeyValue(data.key || '')
    useApiKeysStore.getState().setCreateOpen(false)
    useApiKeysStore.getState().resetForm()
    useApiKeysStore.getState().setNewKeyOpen(true)
    fetchKeys()
    return data
  }, [token, fetchKeys])

  const updateKey = useCallback(async (id: string, body: { name?: string; permissions?: string[]; active?: boolean }) => {
    if (!token) return
    await api.put(`/api-keys/${id}`, body, token)
    useApiKeysStore.getState().setEditOpen(false)
    useApiKeysStore.getState().setSelected(null)
    useApiKeysStore.getState().resetForm()
    fetchKeys()
  }, [token, fetchKeys])

  const toggleActive = useCallback(async (key: ApiKeyRecord) => {
    if (!token) return
    await api.put(`/api-keys/${key.id}`, { active: !key.active }, token)
    fetchKeys()
  }, [token, fetchKeys])

  const regenerateKey = useCallback(async (key: ApiKeyRecord) => {
    if (!token) return
    const data = await api.post<ApiKeyRecord>(`/api-keys/${key.id}/regenerate`, undefined, token)
    useApiKeysStore.getState().setNewKeyValue(data.key || '')
    useApiKeysStore.getState().setNewKeyOpen(true)
    fetchKeys()
    return data
  }, [token, fetchKeys])

  const deleteKey = useCallback(async (id: string) => {
    if (!token) return
    await api.delete(`/api-keys/${id}`, token)
    useApiKeysStore.getState().setDeleteOpen(false)
    useApiKeysStore.getState().setSelected(null)
    fetchKeys()
  }, [token, fetchKeys])

  const openEdit = useCallback((key: ApiKeyRecord) => {
    useApiKeysStore.getState().setSelected(key)
    useApiKeysStore.setState({ formName: key.name, formPerms: key.permissions })
    useApiKeysStore.getState().setEditOpen(true)
  }, [])

  const openDelete = useCallback((key: ApiKeyRecord) => {
    useApiKeysStore.getState().setSelected(key)
    useApiKeysStore.getState().setDeleteOpen(true)
  }, [])

  return {
    keys,
    loading,
    selected,
    fetchKeys,
    createKey,
    updateKey,
    toggleActive,
    regenerateKey,
    deleteKey,
    openEdit,
    openDelete,
  }
}
