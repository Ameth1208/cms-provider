'use client'

import { useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'
import { useCustomersStore } from '../store/customers-store'
import { formatPhone } from '@/components/ui/phone-input'

export function useCustomers() {
  const { token } = useAuth()
  const customers = useCustomersStore((s) => s.customers)
  const loading = useCustomersStore((s) => s.loading)
  const selected = useCustomersStore((s) => s.selected)
  const createOpen = useCustomersStore((s) => s.createOpen)
  const editOpen = useCustomersStore((s) => s.editOpen)
  const formName = useCustomersStore((s) => s.formName)
  const formEmail = useCustomersStore((s) => s.formEmail)
  const formPhone = useCustomersStore((s) => s.formPhone)
  const formPhoneCountry = useCustomersStore((s) => s.formPhoneCountry)
  const formDocument = useCustomersStore((s) => s.formDocument)
  const formDocumentType = useCustomersStore((s) => s.formDocumentType)
  const formNotes = useCustomersStore((s) => s.formNotes)
  const setCreateOpen = useCustomersStore((s) => s.setCreateOpen)
  const setEditOpen = useCustomersStore((s) => s.setEditOpen)
  const setFormName = useCustomersStore((s) => s.setFormName)
  const setFormEmail = useCustomersStore((s) => s.setFormEmail)
  const setFormPhone = useCustomersStore((s) => s.setFormPhone)
  const setFormPhoneCountry = useCustomersStore((s) => s.setFormPhoneCountry)
  const setFormDocument = useCustomersStore((s) => s.setFormDocument)
  const setFormDocumentType = useCustomersStore((s) => s.setFormDocumentType)
  const setFormNotes = useCustomersStore((s) => s.setFormNotes)
  const resetForm = useCustomersStore((s) => s.resetForm)
  const openEdit = useCustomersStore((s) => s.openEdit)

  const fetchCustomers = useCallback(async () => {
    if (!token) return
    useCustomersStore.getState().setLoading(true)
    try {
      const data = await api.get<any[]>('/customers', token)
      useCustomersStore.getState().setCustomers(data)
    } catch {
      useCustomersStore.getState().setCustomers([])
    } finally {
      useCustomersStore.getState().setLoading(false)
    }
  }, [token])

  const createCustomer = useCallback(async () => {
    const state = useCustomersStore.getState()
    if (!token || !state.formEmail.trim()) return
    const phone = state.formPhone.trim()
      ? formatPhone(state.formPhone.trim(), state.formPhoneCountry)
      : undefined
    await api.post('/customers', {
      name: state.formName.trim(),
      email: state.formEmail.trim(),
      phone,
      document: state.formDocument.trim() || undefined,
      documentType: state.formDocumentType,
      notes: state.formNotes.trim() || undefined,
    }, token)
    state.setCreateOpen(false)
    state.resetForm()
    fetchCustomers()
  }, [token, fetchCustomers])

  const updateCustomer = useCallback(async () => {
    const state = useCustomersStore.getState()
    if (!token || !state.selected) return
    const phone = state.formPhone.trim()
      ? formatPhone(state.formPhone.trim(), state.formPhoneCountry)
      : undefined
    await api.put(`/customers/${state.selected.id}`, {
      name: state.formName.trim(),
      email: state.formEmail.trim(),
      phone,
      document: state.formDocument.trim() || undefined,
      documentType: state.formDocumentType,
      notes: state.formNotes.trim() || undefined,
    }, token)
    state.setEditOpen(false)
    state.resetForm()
    fetchCustomers()
  }, [token, fetchCustomers])

  const toggleActive = useCallback(async (customer: any) => {
    if (!token) return
    await api.put(`/customers/${customer.id}`, { active: !customer.active }, token)
    fetchCustomers()
  }, [token, fetchCustomers])

  return {
    customers,
    loading,
    selected,
    createOpen,
    editOpen,
    formName,
    formEmail,
    formPhone,
    formPhoneCountry,
    formDocument,
    formDocumentType,
    formNotes,
    setCreateOpen,
    setEditOpen,
    setFormName,
    setFormEmail,
    setFormPhone,
    setFormPhoneCountry,
    setFormDocument,
    setFormDocumentType,
    setFormNotes,
    resetForm,
    openEdit,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    toggleActive,
  }
}
