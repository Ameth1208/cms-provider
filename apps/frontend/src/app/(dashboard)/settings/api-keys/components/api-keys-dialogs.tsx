'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useApiKeysStore } from '../store/api-keys-store'
import { useApiKeys } from '../hooks/useApiKeys'

const MODULES = [
  { key: 'catalog', label: 'Catálogo', icon: 'lucide:package' },
  { key: 'orders', label: 'Pedidos', icon: 'lucide:shopping-cart' },
  { key: 'inventory', label: 'Inventario', icon: 'lucide:warehouse' },
  { key: 'batches', label: 'Lotes', icon: 'lucide:layers' },
  { key: 'campaigns', label: 'Campañas', icon: 'lucide:tag' },
  { key: 'content', label: 'Contenido', icon: 'lucide:layout-template' },
  { key: 'reviews', label: 'Reseñas', icon: 'lucide:star' },
  { key: 'users', label: 'Usuarios', icon: 'lucide:users' },
  { key: 'settings', label: 'Ajustes', icon: 'lucide:settings' },
  { key: 'media', label: 'Media', icon: 'lucide:image' },
]

const ACTIONS = [
  { key: 'read', label: 'Ver' },
  { key: 'create', label: 'Crear' },
  { key: 'update', label: 'Editar' },
  { key: 'delete', label: 'Eliminar' },
]

function ModulePermissions({
  moduleKey,
  moduleLabel,
  moduleIcon,
  formPerms,
  onToggle,
  prefix = '',
}: {
  moduleKey: string
  moduleLabel: string
  moduleIcon: string
  formPerms: string[]
  onToggle: (perm: string) => void
  prefix?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const modulePermKeys = ACTIONS.map((a) => `${moduleKey}:${a.key}`)
  const selectedCount = modulePermKeys.filter((p) => formPerms.includes(p)).length
  const allSelected = selectedCount === ACTIONS.length

  const toggleAll = () => {
    if (allSelected) {
      modulePermKeys.forEach((p) => {
        if (formPerms.includes(p)) onToggle(p)
      })
    } else {
      modulePermKeys.forEach((p) => {
        if (!formPerms.includes(p)) onToggle(p)
      })
    }
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon icon={moduleIcon} className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{moduleLabel}</span>
          {selectedCount > 0 && (
            <Badge variant="secondary" className="text-[10px] h-5">
              {selectedCount}
            </Badge>
          )}
        </div>
        <Icon
          icon={isOpen ? 'lucide:chevron-up' : 'lucide:chevron-down'}
          className="h-4 w-4 text-muted-foreground"
        />
      </button>

      {isOpen && (
        <div className="px-4 py-3 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              checked={allSelected}
              onChange={toggleAll}
            />
            <span className="text-xs text-muted-foreground">Seleccionar todos</span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            {ACTIONS.map((action) => {
              const perm = `${moduleKey}:${action.key}`
              const checked = formPerms.includes(perm)
              return (
                <label
                  key={`${prefix}${perm}`}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                    checked
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border shrink-0"
                    checked={checked}
                    onChange={() => onToggle(perm)}
                  />
                  <span className="text-xs">{action.label}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export function ApiKeysDialogs() {
  const { t } = useTranslation()
  const selected = useApiKeysStore((s) => s.selected)
  const newKeyValue = useApiKeysStore((s) => s.newKeyValue)
  const createOpen = useApiKeysStore((s) => s.createOpen)
  const editOpen = useApiKeysStore((s) => s.editOpen)
  const newKeyOpen = useApiKeysStore((s) => s.newKeyOpen)
  const deleteOpen = useApiKeysStore((s) => s.deleteOpen)
  const formName = useApiKeysStore((s) => s.formName)
  const formPerms = useApiKeysStore((s) => s.formPerms)
  const copied = useApiKeysStore((s) => s.copied)
  const setCreateOpen = useApiKeysStore((s) => s.setCreateOpen)
  const setEditOpen = useApiKeysStore((s) => s.setEditOpen)
  const setNewKeyOpen = useApiKeysStore((s) => s.setNewKeyOpen)
  const setDeleteOpen = useApiKeysStore((s) => s.setDeleteOpen)
  const setFormName = useApiKeysStore((s) => s.setFormName)
  const setFormPerms = useApiKeysStore((s) => s.setFormPerms)
  const setCopied = useApiKeysStore((s) => s.setCopied)
  const resetForm = useApiKeysStore((s) => s.resetForm)

  const { createKey, updateKey, deleteKey } = useApiKeys()

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleCreate = () => {
    if (!formName.trim()) return
    createKey(formName.trim(), formPerms)
  }

  const handleUpdate = () => {
    if (!selected || !formName.trim()) return
    updateKey(selected.id, { name: formName.trim(), permissions: formPerms })
  }

  const handleDelete = () => {
    if (!selected) return
    deleteKey(selected.id)
  }

  const togglePerm = (perm: string) => {
    if (formPerms.includes(perm)) {
      setFormPerms(formPerms.filter((p) => p !== perm))
    } else {
      setFormPerms([...formPerms, perm])
    }
  }

  return (
    <>
      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-medium">{t('api_keys_create')}</DialogTitle>
            <DialogDescription className="font-light">{t('api_keys_permissions_help')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label>{t('api_keys_name')}</Label>
              <Input
                placeholder={t('api_keys_name_placeholder')}
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Permisos por módulo</Label>
              <div className="space-y-2">
                {MODULES.map((mod) => (
                  <ModulePermissions
                    key={mod.key}
                    moduleKey={mod.key}
                    moduleLabel={mod.label}
                    moduleIcon={mod.icon}
                    formPerms={formPerms}
                    onToggle={togglePerm}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setCreateOpen(false); resetForm() }}>
                {t('api_keys_cancel')}
              </Button>
              <Button onClick={handleCreate} disabled={!formName.trim()}>
                {t('api_keys_create')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-medium">{t('api_keys_edit')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label>{t('api_keys_name')}</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Permisos por módulo</Label>
              <div className="space-y-2">
                {MODULES.map((mod) => (
                  <ModulePermissions
                    key={`edit-${mod.key}`}
                    moduleKey={mod.key}
                    moduleLabel={mod.label}
                    moduleIcon={mod.icon}
                    formPerms={formPerms}
                    onToggle={togglePerm}
                    prefix="edit-"
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setEditOpen(false); resetForm() }}>
                {t('api_keys_cancel')}
              </Button>
              <Button onClick={handleUpdate} disabled={!formName.trim()}>
                {t('api_keys_save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Key Dialog */}
      <Dialog open={newKeyOpen} onOpenChange={setNewKeyOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-medium">{t('api_keys_new_key_title')}</DialogTitle>
            <DialogDescription className="font-light text-destructive">{t('api_keys_new_key_warning')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm font-mono break-all border border-border">
                {newKeyValue}
              </code>
              <Button variant="outline" size="sm" className="shrink-0" onClick={() => copyToClipboard(newKeyValue)}>
                <Icon icon={copied ? 'lucide:check' : 'lucide:copy'} className="h-4 w-4 mr-1" />
                {copied ? t('api_keys_copied') : t('api_keys_copy')}
              </Button>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setNewKeyOpen(false)}>
                {t('api_keys_close')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-medium">{t('confirm_delete')}</DialogTitle>
            <DialogDescription className="font-light">{t('api_keys_delete_confirm')}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {t('api_keys_cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t('delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
