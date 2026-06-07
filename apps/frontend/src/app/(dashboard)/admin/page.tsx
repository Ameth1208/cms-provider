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
import { PageHeader } from '@/components/page-header'

export default function AdminPage() {
  const { user, logout } = useAuth()
  const { t } = useTranslation()

  // Debug: log user roles
  useEffect(() => {
    console.log('User roles:', user?.roles)
    console.log('User permissions:', user?.permissions)
  }, [user])
  const {
    clients,
    loading,
    setCreateOpen,
    fetchClients,
    updateClientStatus,
    updateClientModules,
  } = useAdminClients()

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const isOwner = user?.roles?.includes('OWNER')

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <Icon icon="lucide:shield-alert" className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-muted-foreground font-medium text-lg">Acceso denegado</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Tu usuario no tiene permisos de OWNER. Esto puede pasar si:
          </p>
          <ul className="text-sm text-muted-foreground text-left max-w-sm mx-auto space-y-1">
            <li className="flex items-start gap-2">
              <Icon icon="lucide:alert-circle" className="h-4 w-4 mt-0.5 shrink-0" />
              La base de datos fue reseteada y tu sesión es vieja
            </li>
            <li className="flex items-start gap-2">
              <Icon icon="lucide:alert-circle" className="h-4 w-4 mt-0.5 shrink-0" />
              No estás logueado como admin@cms.cloud
            </li>
          </ul>
        </div>
        <Button variant="outline" onClick={() => logout()}>
          <Icon icon="lucide:log-out" className="h-4 w-4 mr-2" />
          Cerrar sesión y volver a entrar
        </Button>
      </div>
    )
  }

  const activeCount = clients.filter((c) => c.status === 'active').length
  const suspendedCount = clients.filter((c) => c.status === 'suspended').length
  const totalUsers = clients.reduce((sum, c) => sum + (c._count?.users || 0), 0)
  const totalProducts = clients.reduce((sum, c) => sum + (c._count?.catalogItems || 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin')}
        description={t('admin_desc')}
      >
        <Button onClick={() => setCreateOpen(true)}>
          <Icon icon="lucide:plus" className="h-4 w-4 mr-2" />
          Nuevo cliente
        </Button>
      </PageHeader>

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
            onUpdateModules={updateClientModules}
          />
        </CardContent>
      </Card>

      <CreateClientDialog />
    </div>
  )
}
