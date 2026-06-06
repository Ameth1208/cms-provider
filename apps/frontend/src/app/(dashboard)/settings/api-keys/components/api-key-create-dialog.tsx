'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useTranslation } from '@/i18n/use-translation'
import { useApiKeysStore } from '../store/api-keys-store'
import { useApiKeys } from '../hooks/useApiKeys'
import { ApiKeyForm } from './api-key-form'

export function ApiKeyCreateDialog() {
  const { t } = useTranslation()
  const createOpen = useApiKeysStore((s) => s.createOpen)
  const formName = useApiKeysStore((s) => s.formName)
  const setCreateOpen = useApiKeysStore((s) => s.setCreateOpen)
  const resetForm = useApiKeysStore((s) => s.resetForm)
  const { createKey } = useApiKeys()

  const handleCreate = () => {
    if (!formName.trim()) return
    createKey(formName.trim(), useApiKeysStore.getState().formPerms)
  }

  return (
    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-medium">{t('api_keys_create')}</DialogTitle>
          <DialogDescription className="font-light">{t('api_keys_permissions_help')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          <ApiKeyForm />
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
  )
}
