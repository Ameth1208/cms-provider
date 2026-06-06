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

export function ApiKeyDeleteDialog() {
  const { t } = useTranslation()
  const selected = useApiKeysStore((s) => s.selected)
  const deleteOpen = useApiKeysStore((s) => s.deleteOpen)
  const setDeleteOpen = useApiKeysStore((s) => s.setDeleteOpen)
  const { deleteKey } = useApiKeys()

  const handleDelete = () => {
    if (!selected) return
    deleteKey(selected.id)
  }

  return (
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
  )
}
