'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api-client'

export default function UsersPage() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    if (!token) return
    api.get<any[]>('/users', token).then(setUsers)
  }, [token])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Usuarios</h1>

      <div className="bg-background rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3">Nombre</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Roles</th>
              <th className="text-left px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id} className="border-b hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{user.name || '—'}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">
                  {user.roles.map((r: any) => (
                    <span key={r.role.id} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full mr-1">
                      {r.role.name}
                    </span>
                  ))}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
