'use client'

import { useEffect } from 'react'
import { useUsers } from './hooks/use-users'
import { UsersHeader } from './components/users-header'
import { UsersList } from './components/users-list'
import { UserCreateDialog } from './components/user-create-dialog'
import { UserEditDialog } from './components/user-edit-dialog'
import { UserDeleteDialog } from './components/user-delete-dialog'

export default function UsersPage() {
  const { fetchUsers, fetchRoles } = useUsers()

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [fetchUsers, fetchRoles])

  return (
    <div className="space-y-6">
      <UsersHeader />
      <UsersList />
      <UserCreateDialog />
      <UserEditDialog />
      <UserDeleteDialog />
    </div>
  )
}
