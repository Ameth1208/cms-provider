'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTranslation } from '@/i18n/use-translation'
import { useApiKeysStore } from '../store/api-keys-store'
import { useApiKeys } from '../hooks/useApiKeys'
import { ApiKeyForm } from './api-key-form'

export function ApiKeyEditDialog() {
  const { t } = useTranslation()
  const selected = useApiKeysStore((s) => s.selected)
  const editOpen = useApiKeysStore((s) => s.editOpen)
  const formName = useApiKeysStore((s) => s.formName)
  const setEditOpen = useApiKeysStore((s) => s.setEditOpen)
  const resetForm = useApiKeysStore((s) => s.resetForm)
  const { updateKey } = useApiKeys()

  const handleUpdate = () => {
    if (!selected || !formName.trim()) return
    updateKey(selected.id, { name: formName.trim(), permissions: useApiKeysStore.getState().formPerms })
  }

  return (
    <Dialog open={editOpen} onOpenChange={setEditOpen}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-medium">{t('api_keys_edit')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          <ApiKeyForm />
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
  )
}
