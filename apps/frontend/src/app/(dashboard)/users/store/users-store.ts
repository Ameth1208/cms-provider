'use client'

import { create } from 'zustand'

export interface Role {
  id: string
  name: string
}

export interface UserRecord {
  id: string
  email: string
  name: string | null
  active: boolean
  modulesEnabled: string[]
  createdAt: string
  roles: { role: Role }[]
}

interface UsersStore {
  users: UserRecord[]
  roles: Role[]
  loading: boolean
  selected: UserRecord | null
  createOpen: boolean
  editOpen: boolean
  deleteOpen: boolean
  formEmail: string
  formName: string
  formPassword: string
  formRoleIds: string[]
  formModulesEnabled: string[]

  setUsers: (users: UserRecord[]) => void
  setRoles: (roles: Role[]) => void
  setLoading: (loading: boolean) => void
  setSelected: (user: UserRecord | null) => void
  setCreateOpen: (open: boolean) => void
  setEditOpen: (open: boolean) => void
  setDeleteOpen: (open: boolean) => void
  setFormEmail: (v: string) => void
  setFormName: (v: string) => void
  setFormPassword: (v: string) => void
  setFormRoleIds: (v: string[]) => void
  setFormModulesEnabled: (v: string[]) => void
  resetForm: () => void
  openEdit: (user: UserRecord) => void
  openDelete: (user: UserRecord) => void
}

export const useUsersStore = create<UsersStore>((set) => ({
  users: [],
  roles: [],
  loading: false,
  selected: null,
  createOpen: false,
  editOpen: false,
  deleteOpen: false,
  formEmail: '',
  formName: '',
  formPassword: '',
  formRoleIds: [],
  formModulesEnabled: [],

  setUsers: (users) => set({ users }),
  setRoles: (roles) => set({ roles }),
  setLoading: (loading) => set({ loading }),
  setSelected: (selected) => set({ selected }),
  setCreateOpen: (createOpen) => set({ createOpen }),
  setEditOpen: (editOpen) => set({ editOpen }),
  setDeleteOpen: (deleteOpen) => set({ deleteOpen }),
  setFormEmail: (formEmail) => set({ formEmail }),
  setFormName: (formName) => set({ formName }),
  setFormPassword: (formPassword) => set({ formPassword }),
  setFormRoleIds: (formRoleIds) => set({ formRoleIds }),
  setFormModulesEnabled: (formModulesEnabled) => set({ formModulesEnabled }),

  resetForm: () => set({
    formEmail: '',
    formName: '',
    formPassword: '',
    formRoleIds: [],
    formModulesEnabled: [],
    selected: null,
  }),

  openEdit: (user) => set({
    selected: user,
    formName: user.name || '',
    formRoleIds: user.roles.map((r) => r.role.id),
    formModulesEnabled: user.modulesEnabled ?? [],
    editOpen: true,
  }),

  openDelete: (user) => set({
    selected: user,
    deleteOpen: true,
  }),
}))
