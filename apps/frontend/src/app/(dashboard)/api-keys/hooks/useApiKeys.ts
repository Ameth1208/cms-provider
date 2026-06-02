'use client'

import { useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api-client'
import { useApiKeysStore, type ApiKeyRecord } from '../store/api-keys-store'

export function useApiKeys() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined

  const {
    keys, loading, selected,
    setKeys, setLoading, setSelected,
    setNewKeyValue, setCreateOpen, setEditOpen, setNewKeyOpen, setDeleteOpen,
    resetForm,
  } = useApiKeysStore()

  const fetchKeys = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await api.get<ApiKeyRecord[]>('/api-keys', token)
      setKeys(data)
    } catch {
      setKeys([])
    } finally {
      setLoading(false)
    }
  }, [token, setKeys, setLoading])

  const createKey = useCallback(async (name: string, permissions: string[]) => {
    if (!token || !name.trim()) return
    const data = await api.post<ApiKeyRecord>('/api-keys', { name: name.trim(), permissions }, token)
    setNewKeyValue(data.key || '')
    setCreateOpen(false)
    resetForm()
    setNewKeyOpen(true)
    fetchKeys()
    return data
  }, [token, setNewKeyValue, setCreateOpen, resetForm, setNewKeyOpen, fetchKeys])

  const updateKey = useCallback(async (id: string, body: { name?: string; permissions?: string[]; active?: boolean }) => {
    if (!token) return
    await api.put(`/api-keys/${id}`, body, token)
    setEditOpen(false)
    setSelected(null)
    resetForm()
    fetchKeys()
  }, [token, setEditOpen, setSelected, resetForm, fetchKeys])

  const toggleActive = useCallback(async (key: ApiKeyRecord) => {
    if (!token) return
    await api.put(`/api-keys/${key.id}`, { active: !key.active }, token)
    fetchKeys()
  }, [token, fetchKeys])

  const regenerateKey = useCallback(async (key: ApiKeyRecord) => {
    if (!token) return
    const data = await api.post<ApiKeyRecord>(`/api-keys/${key.id}/regenerate`, undefined, token)
    setNewKeyValue(data.key || '')
    setNewKeyOpen(true)
    fetchKeys()
    return data
  }, [token, setNewKeyValue, setNewKeyOpen, fetchKeys])

  const deleteKey = useCallback(async (id: string) => {
    if (!token) return
    await api.delete(`/api-keys/${id}`, token)
    setDeleteOpen(false)
    setSelected(null)
    fetchKeys()
  }, [token, setDeleteOpen, setSelected, fetchKeys])

  const openEdit = useCallback((key: ApiKeyRecord) => {
    setSelected(key)
    useApiKeysStore.setState({ formName: key.name, formPerms: key.permissions })
    setEditOpen(true)
  }, [setSelected, setEditOpen])

  const openDelete = useCallback((key: ApiKeyRecord) => {
    setSelected(key)
    setDeleteOpen(true)
  }, [setSelected, setDeleteOpen])

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
