'use client'

import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useApiKeysStore } from '../store/api-keys-store'
import { useApiKeys } from '../hooks/useApiKeys'

const ALL_PERMISSIONS = [
  'catalog:read', 'catalog:create', 'catalog:update', 'catalog:delete',
  'orders:read', 'orders:create', 'orders:update', 'orders:delete',
  'inventory:read', 'inventory:create', 'inventory:update', 'inventory:delete',
  'campaigns:read', 'campaigns:create', 'campaigns:update', 'campaigns:delete',
  'users:read', 'users:create', 'users:update', 'users:delete',
  'settings:read', 'settings:update',
  'media:read', 'media:create', 'media:delete',
]

const RESOURCE_LABELS: Record<string, string> = {
  catalog: 'Catálogo',
  orders: 'Pedidos',
  inventory: 'Inventario',
  campaigns: 'Campañas',
  users: 'Usuarios',
  settings: 'Ajustes',
  media: 'Media',
}

export function ApiKeysDialogs() {
  const { t } = useTranslation()
  const {
    selected, newKeyValue,
    createOpen, editOpen, newKeyOpen, deleteOpen,
    formName, formPerms, copied,
    setCreateOpen, setEditOpen, setNewKeyOpen, setDeleteOpen,
    setFormName, setFormPerms, setCopied,
    resetForm,
  } = useApiKeysStore()

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

  const permissionGrid = () => (
    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-border rounded-xl p-3">
      {ALL_PERMISSIONS.map((perm) => {
        const [resource, action] = perm.split(':')
        const checked = formPerms.includes(perm)
        return (
          <label
            key={perm}
            className="flex items-center gap-2 text-sm font-light cursor-pointer hover:bg-accent/50 rounded-lg px-2 py-1.5 transition-colors"
          >
            <input
              type="checkbox"
              className="rounded border-border"
              checked={checked}
              onChange={(e) => {
                if (e.target.checked) setFormPerms((prev) => [...prev, perm])
                else setFormPerms((prev) => prev.filter((p) => p !== perm))
              }}
            />
            <span className="text-muted-foreground">{RESOURCE_LABELS[resource] || resource}</span>
            <span className="text-xs text-foreground">{action}</span>
          </label>
        )
      })}
    </div>
  )

  return (
    <>
      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-medium">{t('api_keys_create')}</DialogTitle>
            <DialogDescription className="font-light">{t('api_keys_permissions_help')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label className="font-medium">{t('api_keys_name')}</Label>
              <Input
                placeholder={t('api_keys_name_placeholder')}
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-medium">{t('api_keys_permissions')}</Label>
              {permissionGrid()}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setCreateOpen(false); resetForm() }} className="rounded-full">
                {t('api_keys_cancel')}
              </Button>
              <Button onClick={handleCreate} disabled={!formName.trim()} className="rounded-full">
                {t('api_keys_create')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-medium">{t('api_keys_edit')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label className="font-medium">{t('api_keys_name')}</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="font-medium">{t('api_keys_permissions')}</Label>
              {permissionGrid()}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setEditOpen(false); resetForm() }} className="rounded-full">
                {t('api_keys_cancel')}
              </Button>
              <Button onClick={handleUpdate} disabled={!formName.trim()} className="rounded-full">
                {t('api_keys_save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Key Dialog */}
      <Dialog open={newKeyOpen} onOpenChange={setNewKeyOpen}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-medium">{t('api_keys_new_key_title')}</DialogTitle>
            <DialogDescription className="font-light text-destructive">{t('api_keys_new_key_warning')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm font-mono break-all border border-border">
                {newKeyValue}
              </code>
              <Button variant="outline" size="sm" className="shrink-0 rounded-full" onClick={() => copyToClipboard(newKeyValue)}>
                <Icon icon={copied ? 'lucide:check' : 'lucide:copy'} className="h-4 w-4 mr-1" />
                {copied ? t('api_keys_copied') : t('api_keys_copy')}
              </Button>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setNewKeyOpen(false)} className="rounded-full">
                {t('api_keys_close')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-medium">{t('confirm_delete')}</DialogTitle>
            <DialogDescription className="font-light">{t('api_keys_delete_confirm')}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="rounded-full">
              {t('api_keys_cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-full">
              {t('delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
