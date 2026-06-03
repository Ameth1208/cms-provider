'use client'

import { useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'
import { useUsersStore } from '../store/users-store'

export function useUsers() {
  const { token } = useAuth()
  const users = useUsersStore((s) => s.users)
  const roles = useUsersStore((s) => s.roles)
  const loading = useUsersStore((s) => s.loading)
  const selected = useUsersStore((s) => s.selected)
  const createOpen = useUsersStore((s) => s.createOpen)
  const editOpen = useUsersStore((s) => s.editOpen)
  const deleteOpen = useUsersStore((s) => s.deleteOpen)
  const formEmail = useUsersStore((s) => s.formEmail)
  const formName = useUsersStore((s) => s.formName)
  const formPassword = useUsersStore((s) => s.formPassword)
  const formRoleIds = useUsersStore((s) => s.formRoleIds)
  const formModulesEnabled = useUsersStore((s) => s.formModulesEnabled)
  const setCreateOpen = useUsersStore((s) => s.setCreateOpen)
  const setEditOpen = useUsersStore((s) => s.setEditOpen)
  const setDeleteOpen = useUsersStore((s) => s.setDeleteOpen)
  const setFormEmail = useUsersStore((s) => s.setFormEmail)
  const setFormName = useUsersStore((s) => s.setFormName)
  const setFormPassword = useUsersStore((s) => s.setFormPassword)
  const setFormRoleIds = useUsersStore((s) => s.setFormRoleIds)
  const setFormModulesEnabled = useUsersStore((s) => s.setFormModulesEnabled)
  const resetForm = useUsersStore((s) => s.resetForm)
  const openEdit = useUsersStore((s) => s.openEdit)
  const openDelete = useUsersStore((s) => s.openDelete)

  const fetchUsers = useCallback(async () => {
    if (!token) return
    useUsersStore.getState().setLoading(true)
    try {
      const data = await api.get<any[]>('/users', token)
      useUsersStore.getState().setUsers(data)
    } catch {
      useUsersStore.getState().setUsers([])
    } finally {
      useUsersStore.getState().setLoading(false)
    }
  }, [token])

  const fetchRoles = useCallback(async () => {
    if (!token) return
    try {
      const data = await api.get<any[]>('/roles', token)
      useUsersStore.getState().setRoles(data)
    } catch {
      useUsersStore.getState().setRoles([])
    }
  }, [token])

  const createUser = useCallback(async () => {
    const state = useUsersStore.getState()
    if (!token || !state.formEmail.trim()) return
    const tempPassword = Math.random().toString(36).slice(2, 14) + Math.random().toString(36).slice(2, 14)
    await api.post('/users', {
      email: state.formEmail.trim(),
      password: tempPassword,
      name: state.formName.trim() || undefined,
      roleIds: state.formRoleIds,
      modulesEnabled: state.formModulesEnabled,
    }, token)
    fetchUsers()
  }, [token, fetchUsers])

  const updateUser = useCallback(async () => {
    const state = useUsersStore.getState()
    if (!token || !state.selected) return
    await api.put(`/users/${state.selected.id}`, {
      name: state.formName.trim() || undefined,
      active: state.selected.active,
      roleIds: state.formRoleIds,
      modulesEnabled: state.formModulesEnabled,
    }, token)
    state.setEditOpen(false)
    state.resetForm()
    fetchUsers()
  }, [token, fetchUsers])

  const toggleActive = useCallback(async (user: any) => {
    if (!token) return
    await api.put(`/users/${user.id}`, { active: !user.active }, token)
    fetchUsers()
  }, [token, fetchUsers])

  const deleteUser = useCallback(async () => {
    const state = useUsersStore.getState()
    if (!token || !state.selected) return
    await api.delete(`/users/${state.selected.id}`, token)
    state.setDeleteOpen(false)
    state.resetForm()
    fetchUsers()
  }, [token, fetchUsers])

  return {
    users,
    roles,
    loading,
    selected,
    createOpen,
    editOpen,
    deleteOpen,
    formEmail,
    formName,
    formPassword,
    formRoleIds,
    formModulesEnabled,
    setCreateOpen,
    setEditOpen,
    setDeleteOpen,
    setFormEmail,
    setFormName,
    setFormPassword,
    setFormRoleIds,
    setFormModulesEnabled,
    resetForm,
    openEdit,
    openDelete,
    fetchUsers,
    fetchRoles,
    createUser,
    updateUser,
    toggleActive,
    deleteUser,
  }
}
