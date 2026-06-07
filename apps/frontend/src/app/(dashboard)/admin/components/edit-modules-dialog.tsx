'use client'

import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import type { Client } from '../hooks/use-admin-clients'

const MODULE_GROUPS = [
  {
    label: 'Negocio',
    modules: [
      { key: 'catalog', label: 'Catálogo', icon: 'lucide:package' },
      { key: 'orders', label: 'Pedidos', icon: 'lucide:shopping-cart' },
      { key: 'payments', label: 'Pagos', icon: 'lucide:credit-card' },
      { key: 'customers', label: 'Clientes', icon: 'lucide:user-check' },
      { key: 'campaigns', label: 'Campañas', icon: 'lucide:tag' },
      { key: 'inventory', label: 'Inventario', icon: 'lucide:warehouse' },
    ],
  },
  {
    label: 'Logística',
    modules: [
      { key: 'drivers', label: 'Repartidores', icon: 'lucide:truck' },
      { key: 'deliveries', label: 'Entregas', icon: 'lucide:package-check' },
      { key: 'delivery_routes', label: 'Rutas', icon: 'lucide:route' },
      { key: 'delivery_zones', label: 'Zonas', icon: 'lucide:map' },
      { key: 'shipping', label: 'Envíos', icon: 'lucide:ship' },
      { key: 'returns', label: 'Devoluciones', icon: 'lucide:rotate-ccw' },
      { key: 'locations', label: 'Sedes', icon: 'lucide:map-pin' },
    ],
  },
  {
    label: 'Contenido',
    modules: [
      { key: 'content', label: 'Contenido', icon: 'lucide:layout-template' },
      { key: 'reviews', label: 'Reseñas', icon: 'lucide:star' },
    ],
  },
  {
    label: 'Equipo y Configuración',
    modules: [
      { key: 'users', label: 'Usuarios', icon: 'lucide:users' },
      { key: 'invitations', label: 'Invitaciones', icon: 'lucide:mail-plus' },
      { key: 'settings', label: 'Ajustes', icon: 'lucide:settings' },
      { key: 'apiKeys', label: 'API Keys', icon: 'lucide:key' },
    ],
  },
]

interface EditModulesDialogProps {
  client: Client | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (id: string, modules: string[]) => void
}

export function EditModulesDialog({
  client,
  open,
  onOpenChange,
  onSave,
}: EditModulesDialogProps) {
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if (client) {
      setSelected(client.modulesEnabled || [])
    }
  }, [client])

  const toggle = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const handleSave = () => {
    if (client) {
      onSave(client.id, selected)
      onOpenChange(false)
    }
  }

  const enabledCount = selected.length
  const totalModules = MODULE_GROUPS.flatMap((g) => g.modules).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 border-border overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-3 shrink-0">
          <DialogTitle className="text-base">Módulos habilitados</DialogTitle>
          <DialogDescription>
            {client?.name} · {enabledCount} de {totalModules} activos
          </DialogDescription>
        </DialogHeader>

        <div className="px-2 py-2 overflow-y-auto max-h-[55vh]">
          <div className="space-y-5">
            {MODULE_GROUPS.map((group) => (
              <div key={group.label} className="space-y-1">
                <p className="px-4 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.modules.map((mod) => {
                    const isEnabled = selected.includes(mod.key)
                    return (
                      <button
                        key={mod.key}
                        onClick={() => toggle(mod.key)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                          isEnabled
                            ? 'bg-primary/[0.04]'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <Icon
                          icon={mod.icon}
                          className={`h-[18px] w-[18px] shrink-0 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`}
                        />

                        <span className={`flex-1 text-sm ${isEnabled ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                          {mod.label}
                        </span>

                        <div
                          className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isEnabled
                              ? 'bg-primary border-primary scale-100'
                              : 'border-muted-foreground/30 scale-90'
                          }`}
                        >
                          {isEnabled && (
                            <Icon icon="lucide:check" className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 shrink-0 border-t border-border">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSave}>Guardar cambios</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
