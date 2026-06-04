'use client'

import {
  Check,
  Package,
  ShoppingCart,
  Warehouse,
  Tag,
  Users,
  LayoutTemplate,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useTranslation } from '@/i18n/use-translation'
import { useUsers } from '../hooks/use-users'

const AVAILABLE_MODULES = [
  { key: 'catalog', label: 'Catálogo', Icon: Package },
  { key: 'orders', label: 'Pedidos', Icon: ShoppingCart },
  { key: 'inventory', label: 'Inventario', Icon: Warehouse },
  { key: 'campaigns', label: 'Campañas', Icon: Tag },
  { key: 'users', label: 'Usuarios', Icon: Users },
  { key: 'content', label: 'Contenido', Icon: LayoutTemplate },
  { key: 'settings', label: 'Ajustes', Icon: Settings },
]

export function UserEditDialog() {
  const { t } = useTranslation()
  const {
    editOpen,
    formName,
    formRoleIds,
    formModulesEnabled,
    roles,
    selected,
    setEditOpen,
    setFormName,
    setFormRoleIds,
    setFormModulesEnabled,
    resetForm,
    updateUser,
  } = useUsers()

  const allSelected = formModulesEnabled.length === AVAILABLE_MODULES.length

  const toggleAllModules = () => {
    if (allSelected) {
      setFormModulesEnabled([])
    } else {
      setFormModulesEnabled(AVAILABLE_MODULES.map((m) => m.key))
    }
  }

  return (
    <Dialog open={editOpen} onOpenChange={setEditOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-medium">{t('users_edit')}</DialogTitle>
          <DialogDescription className="font-light">{selected?.email}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <div className="space-y-2">
            <Label>{t('users_name')}</Label>
            <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder={t('users_name')} />
          </div>

          <div className="space-y-2">
            <Label>{t('users_roles')}</Label>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  title={t(`role_description_${role.name}`) || ''}
                  onClick={() => {
                    setFormRoleIds(
                      formRoleIds.includes(role.id)
                        ? formRoleIds.filter((id) => id !== role.id)
                        : [...formRoleIds, role.id],
                    )
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                    formRoleIds.includes(role.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-accent'
                  }`}
                >
                  {t(`role_${role.name}`) || role.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t('users_modules')}</Label>
              <button
                type="button"
                onClick={toggleAllModules}
                className="text-xs text-primary hover:underline"
              >
                {allSelected ? t('users_deselect_all') : t('users_select_all')}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_MODULES.map((mod) => {
                const enabled = formModulesEnabled.includes(mod.key)
                const ModIcon = mod.Icon
                return (
                  <button
                    key={mod.key}
                    type="button"
                    onClick={() => {
                      setFormModulesEnabled(
                        enabled
                          ? formModulesEnabled.filter((k) => k !== mod.key)
                          : [...formModulesEnabled, mod.key],
                      )
                    }}
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
                      <ModIcon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium">{mod.label}</span>
                    {enabled && <Check className="h-3.5 w-3.5 ml-auto" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditOpen(false)
                resetForm()
              }}
            >
              {t('cancel')}
            </Button>
            <Button onClick={updateUser}>{t('users_save_changes')}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
