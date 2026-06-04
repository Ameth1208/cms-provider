'use client'

import { useEffect } from 'react'
import { useCustomers } from './hooks/use-customers'
import { CustomersHeader } from './components/customers-header'
import { CustomersList } from './components/customers-list'
import { CustomerCreateDialog } from './components/customer-create-dialog'
import { CustomerEditDialog } from './components/customer-edit-dialog'

export default function CustomersPage() {
  const { fetchCustomers } = useCustomers()

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  return (
    <div className="space-y-6">
      <CustomersHeader />
      <CustomersList />
      <CustomerCreateDialog />
      <CustomerEditDialog />
    </div>
  )
}
