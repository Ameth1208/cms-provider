import { Icon } from '@iconify/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'
import type { Client } from '../hooks/use-admin-clients'
import { EditModulesDialog } from './edit-modules-dialog'

const ALL_MODULES = [
  { key: 'catalog', label: 'Catálogo', icon: 'lucide:package' },
  { key: 'inventory', label: 'Inventario', icon: 'lucide:warehouse' },
  { key: 'orders', label: 'Pedidos', icon: 'lucide:shopping-cart' },
  { key: 'campaigns', label: 'Campañas', icon: 'lucide:tag' },
  { key: 'content', label: 'Contenido', icon: 'lucide:layout-template' },
  { key: 'users', label: 'Usuarios', icon: 'lucide:users' },
  { key: 'reviews', label: 'Reseñas', icon: 'lucide:star' },
  { key: 'settings', label: 'Ajustes', icon: 'lucide:settings' },
  { key: 'apiKeys', label: 'API Keys', icon: 'lucide:key' },
]

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  active: {
    label: 'Activo',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    icon: 'lucide:check-circle',
  },
  suspended: {
    label: 'Suspendido',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: 'lucide:pause-circle',
  },
  inactive: {
    label: 'Inactivo',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
    icon: 'lucide:circle-off',
  },
}

interface ClientsListProps {
  clients: Client[]
  loading: boolean
  onToggleStatus: (id: string, status: string) => void
  onUpdateModules: (id: string, modules: string[]) => void
}

export function ClientsList({ clients, loading, onToggleStatus, onUpdateModules }: ClientsListProps) {
  const [editModulesClient, setEditModulesClient] = useState<Client | null>(null)
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-xl">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    )
  }

  if (clients.length === 0) {
    return (
      <div className="py-12 text-center">
        <Icon icon="lucide:building-2" className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
        <p className="text-muted-foreground">No hay clientes registrados</p>
        <p className="text-sm text-muted-foreground mt-1">Crea tu primer cliente para comenzar</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {clients.map((client) => {
        const status = STATUS_CONFIG[client.status] || STATUS_CONFIG.inactive
        const enabledModules = ALL_MODULES.filter((m) =>
          client.modulesEnabled?.includes(m.key)
        )

        return (
          <Card key={client.id} className="overflow-hidden hover:border-primary/20 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon icon="lucide:building-2" className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium truncate">{client.name}</h3>
                      <p className="text-xs text-muted-foreground">{client.slug}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`shrink-0 ${status.color}`}
                    >
                      <Icon icon={status.icon} className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Icon icon="lucide:users" className="h-3.5 w-3.5" />
                      <span>{client._count.users} usuarios</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Icon icon="lucide:package" className="h-3.5 w-3.5" />
                      <span>{client._count.catalogItems} productos</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Icon icon="lucide:calendar" className="h-3.5 w-3.5" />
                      <span>{new Date(client.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Modules */}
                  <div className="flex flex-wrap gap-1.5">
                    {enabledModules.map((mod) => (
                      <span
                        key={mod.key}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-[11px] text-muted-foreground"
                      >
                        <Icon icon={mod.icon} className="h-3 w-3" />
                        {mod.label}
                      </span>
                    ))}
                    {enabledModules.length === 0 && (
                      <span className="text-xs text-muted-foreground">Sin módulos habilitados</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditModulesClient(client)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Icon icon="lucide:settings" className="h-3.5 w-3.5 mr-1" />
                    Módulos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onToggleStatus(
                        client.id,
                        client.status === 'active' ? 'suspended' : 'active'
                      )
                    }
                    className={
                      client.status === 'active'
                        ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                        : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                    }
                  >
                    <Icon
                      icon={client.status === 'active' ? 'lucide:pause' : 'lucide:play'}
                      className="h-3.5 w-3.5 mr-1"
                    />
                    {client.status === 'active' ? 'Suspender' : 'Activar'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
      
      <EditModulesDialog
        client={editModulesClient}
        open={!!editModulesClient}
        onOpenChange={(open) => !open && setEditModulesClient(null)}
        onSave={onUpdateModules}
      />
    </div>
  )
}
