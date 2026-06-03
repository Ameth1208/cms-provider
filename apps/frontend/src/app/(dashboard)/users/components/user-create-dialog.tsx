'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useTranslation } from '@/i18n/use-translation'
import { useUsers } from '../hooks/use-users'

const AVAILABLE_MODULES = [
  { key: 'catalog', label: 'Catálogo', icon: 'lucide:package' },
  { key: 'orders', label: 'Pedidos', icon: 'lucide:shopping-cart' },
  { key: 'inventory', label: 'Inventario', icon: 'lucide:warehouse' },
  { key: 'campaigns', label: 'Campañas', icon: 'lucide:tag' },
  { key: 'users', label: 'Usuarios', icon: 'lucide:users' },
  { key: 'content', label: 'Contenido', icon: 'lucide:layout-template' },
  { key: 'settings', label: 'Ajustes', icon: 'lucide:settings' },
]

export function UserCreateDialog() {
  const { t } = useTranslation()
  const {
    createOpen,
    formEmail,
    formName,
    formRoleIds,
    formModulesEnabled,
    roles,
    setCreateOpen,
    setFormEmail,
    setFormName,
    setFormRoleIds,
    setFormModulesEnabled,
    resetForm,
    createUser,
  } = useUsers()

  const [invited, setInvited] = useState(false)

  const allSelected = formModulesEnabled.length === AVAILABLE_MODULES.length

  const toggleAllModules = () => {
    if (allSelected) {
      setFormModulesEnabled([])
    } else {
      setFormModulesEnabled(AVAILABLE_MODULES.map((m) => m.key))
    }
  }

  const handleCreate = async () => {
    await createUser()
    setInvited(true)
    setTimeout(() => {
      setInvited(false)
    }, 4000)
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setInvited(false)
      resetForm()
    }
    setCreateOpen(open)
  }

  return (
    <Dialog open={createOpen} onOpenChange={handleClose}>
      <DialogContent className="rounded-2xl max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-medium">{t('users_invite')}</DialogTitle>
          <DialogDescription className="font-light">{t('users_invite_desc')}</DialogDescription>
        </DialogHeader>

        {invited ? (
          <div className="py-8 flex flex-col items-center gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon icon="lucide:mail-check" className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">{t('users_invite_sent')}</p>
              <p className="text-sm text-muted-foreground font-light">
                {t('users_invite_sent_desc', { email: formEmail.trim() })}
              </p>
            </div>
            <Button variant="outline" onClick={() => handleClose(false)} className="mt-2">
              {t('users_close')}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            <div className="space-y-2">
              <Label>{t('users_email')}</Label>
              <Input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('users_name')}</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={t('users_name')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('users_roles')}</Label>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
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
                    {role.name}
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
              <Button variant="outline" onClick={() => handleClose(false)}>
                {t('cancel')}
              </Button>
              <Button onClick={handleCreate} disabled={!formEmail.trim()}>
                {t('users_send_invite')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
