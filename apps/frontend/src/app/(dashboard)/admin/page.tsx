'use client'

import { useEffect } from 'react'
import { Icon } from '@iconify/react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from '@/i18n/use-translation'
import { useAdminClients } from './hooks/use-admin-clients'
import { ClientsList } from './components/clients-list'
import { CreateClientDialog } from './components/create-client-dialog'

export default function AdminPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const {
    clients,
    loading,
    setCreateOpen,
    fetchClients,
    updateClientStatus,
  } = useAdminClients()

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const isOwner = user?.roles?.includes('OWNER')

  if (!isOwner) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">Acceso denegado</p>
      </div>
    )
  }

  const activeCount = clients.filter((c) => c.status === 'active').length
  const suspendedCount = clients.filter((c) => c.status === 'suspended').length
  const totalUsers = clients.reduce((sum, c) => sum + (c._count?.users || 0), 0)
  const totalProducts = clients.reduce((sum, c) => sum + (c._count?.catalogItems || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Panel de Administración</h1>
          <p className="text-sm text-muted-foreground font-light mt-1">
            Gestiona todos los clientes desde un solo lugar
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Icon icon="lucide:plus" className="h-4 w-4 mr-2" />
          Nuevo cliente
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon icon="lucide:building-2" className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total clientes</p>
                <p className="text-2xl font-semibold">{clients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Icon icon="lucide:check-circle" className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Activos</p>
                <p className="text-2xl font-semibold">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Icon icon="lucide:users" className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Usuarios totales</p>
                <p className="text-2xl font-semibold">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Icon icon="lucide:package" className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Productos</p>
                <p className="text-2xl font-semibold">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">Clientes</CardTitle>
              <p className="text-sm text-muted-foreground">{clients.length} registrados · {suspendedCount} suspendidos</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ClientsList
            clients={clients}
            loading={loading}
            onToggleStatus={updateClientStatus}
          />
        </CardContent>
      </Card>

      <CreateClientDialog />
    </div>
  )
}
