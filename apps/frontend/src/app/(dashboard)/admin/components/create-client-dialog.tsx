'use client'

import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useTranslation } from '@/i18n/use-translation'
import { useAdminClients } from '../hooks/use-admin-clients'

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

export function CreateClientDialog() {
  const { t } = useTranslation()
  const {
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
    createClient,
    resetForm,
  } = useAdminClients()

  const handleOpenChange = (open: boolean) => {
    setCreateOpen(open)
    if (!open) {
      resetForm()
      setCreatedPassword(null)
    }
  }

  return (
    <Dialog open={createOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-medium">Nuevo Cliente</DialogTitle>
          <DialogDescription className="font-light">
            Crea una nueva organización con un administrador
          </DialogDescription>
        </DialogHeader>

        {createdPassword ? (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="lucide:check-circle" className="h-5 w-5 text-emerald-600" />
                <p className="font-medium text-emerald-800 dark:text-emerald-400">Cliente creado exitosamente</p>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Comparte esta contraseña temporal con el administrador:
              </p>
              <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
                <code className="flex-1 text-sm font-mono">{createdPassword}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(createdPassword)}
                >
                  <Icon icon="lucide:copy" className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button
              onClick={() => {
                setCreatedPassword(null)
                setCreateOpen(false)
              }}
              className="w-full"
            >
              Cerrar
            </Button>
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label>Nombre de la empresa</Label>
              <Input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Ej: Mi Empresa S.A."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Email del administrador</Label>
                <Input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@empresa.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Nombre del administrador</Label>
                <Input
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Juan Pérez"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Contraseña (opcional)</Label>
              <Input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Dejar en blanco para generar automáticamente"
              />
              <p className="text-xs text-muted-foreground">Si la dejas en blanco, se generará una contraseña temporal</p>
            </div>

            <div className="space-y-3">
              <Label>Módulos habilitados</Label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_MODULES.map((mod) => {
                  const enabled = selectedModules.includes(mod.key)
                  return (
                    <button
                      key={mod.key}
                      type="button"
                      onClick={() => toggleModule(mod.key)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm transition-all ${
                        enabled
                          ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center h-8 w-8 rounded-lg ${
                          enabled ? 'bg-primary/15' : 'bg-muted'
                        }`}
                      >
                        <Icon icon={mod.icon} className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-medium">{mod.label}</span>
                      {enabled && <Icon icon="lucide:check" className="h-3.5 w-3.5 ml-auto" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={createClient}
                disabled={saving || !orgName.trim() || !adminEmail.trim()}
              >
                {saving ? 'Creando...' : 'Crear cliente'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
