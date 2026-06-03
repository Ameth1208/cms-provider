'use client'

import { useCallback, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'

export interface Client {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  modulesEnabled: string[]
  status: string
  createdAt: string
  updatedAt: string
  _count: {
    users: number
    catalogItems: number
  }
}

export function useAdminClients() {
  const { token } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [orgName, setOrgName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [selectedModules, setSelectedModules] = useState<string[]>(['catalog', 'orders'])
  const [createdPassword, setCreatedPassword] = useState<string | null>(null)

  const fetchClients = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await api.get<Client[]>('/admin/clients', token)
      setClients(data)
    } catch {
      setClients([])
    } finally {
      setLoading(false)
    }
  }, [token])

  const createClient = useCallback(async () => {
    if (!token || !orgName.trim() || !adminEmail.trim()) return
    setSaving(true)
    try {
      const result = await api.post('/admin/clients', {
        organizationName: orgName.trim(),
        adminEmail: adminEmail.trim(),
        adminName: adminName.trim() || undefined,
        adminPassword: adminPassword.trim() || undefined,
        modulesEnabled: selectedModules,
      }, token)
      
      if (result.admin?.temporaryPassword) {
        setCreatedPassword(result.admin.temporaryPassword)
      }
      
      resetForm()
      fetchClients()
      return true
    } catch {
      return false
    } finally {
      setSaving(false)
    }
  }, [token, orgName, adminEmail, adminName, adminPassword, selectedModules, fetchClients])

  const updateClientStatus = useCallback(async (id: string, status: string) => {
    if (!token) return
    try {
      await api.put(`/admin/clients/${id}/status`, { status }, token)
      fetchClients()
    } catch {
      // error handled silently
    }
  }, [token, fetchClients])

  const updateClientModules = useCallback(async (id: string, modules: string[]) => {
    if (!token) return
    try {
      await api.put(`/admin/clients/${id}/modules`, { modulesEnabled: modules }, token)
      fetchClients()
    } catch {
      // error handled silently
    }
  }, [token, fetchClients])

  const resetForm = () => {
    setOrgName('')
    setAdminEmail('')
    setAdminName('')
    setAdminPassword('')
    setSelectedModules(['catalog', 'orders'])
    setCreateOpen(false)
  }

  const toggleModule = (module: string) => {
    setSelectedModules((prev) =>
      prev.includes(module) ? prev.filter((m) => m !== module) : [...prev, module],
    )
  }

  return {
    clients,
    loading,
    createOpen,
    setCreateOpen,
    saving,
    orgName,
    setOrgName,
    adminEmail,
    setAdminEmail,
    adminName,
    setAdminName,
    adminPassword,
    setAdminPassword,
    selectedModules,
    toggleModule,
    createdPassword,
    setCreatedPassword,
    fetchClients,
    createClient,
    updateClientStatus,
    updateClientModules,
    resetForm,
  }
}
