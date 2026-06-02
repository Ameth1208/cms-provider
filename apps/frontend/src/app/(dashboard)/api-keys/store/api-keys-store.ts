'use client'

import { create } from 'zustand'

export interface ApiKeyRecord {
  id: string
  name: string
  keyPrefix: string
  permissions: string[]
  active: boolean
  lastUsedAt: string | null
  createdAt: string
  updatedAt: string
  key?: string
}

interface ApiKeysState {
  keys: ApiKeyRecord[]
  loading: boolean
  selected: ApiKeyRecord | null
  newKeyValue: string
  createOpen: boolean
  editOpen: boolean
  newKeyOpen: boolean
  deleteOpen: boolean
  formName: string
  formPerms: string[]
  copied: boolean
  setKeys: (keys: ApiKeyRecord[]) => void
  setLoading: (loading: boolean) => void
  setSelected: (selected: ApiKeyRecord | null) => void
  setNewKeyValue: (value: string) => void
  setCreateOpen: (open: boolean) => void
  setEditOpen: (open: boolean) => void
  setNewKeyOpen: (open: boolean) => void
  setDeleteOpen: (open: boolean) => void
  setFormName: (name: string) => void
  setFormPerms: (perms: string[] | ((prev: string[]) => string[])) => void
  setCopied: (copied: boolean) => void
  resetForm: () => void
}

export const useApiKeysStore = create<ApiKeysState>((set) => ({
  keys: [],
  loading: true,
  selected: null,
  newKeyValue: '',
  createOpen: false,
  editOpen: false,
  newKeyOpen: false,
  deleteOpen: false,
  formName: '',
  formPerms: [],
  copied: false,
  setKeys: (keys) => set({ keys }),
  setLoading: (loading) => set({ loading }),
  setSelected: (selected) => set({ selected }),
  setNewKeyValue: (newKeyValue) => set({ newKeyValue }),
  setCreateOpen: (createOpen) => set({ createOpen }),
  setEditOpen: (editOpen) => set({ editOpen }),
  setNewKeyOpen: (newKeyOpen) => set({ newKeyOpen }),
  setDeleteOpen: (deleteOpen) => set({ deleteOpen }),
  setFormName: (formName) => set({ formName }),
  setFormPerms: (formPerms) =>
    set((s) => ({
      formPerms: typeof formPerms === 'function' ? formPerms(s.formPerms) : formPerms,
    })),
  setCopied: (copied) => set({ copied }),
  resetForm: () => set({ formName: '', formPerms: [] }),
}))
