'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useTranslation } from '@/i18n/use-translation'
import { useUsers } from '../hooks/use-users'

export function UserDeleteDialog() {
  const { t } = useTranslation()
  const { deleteOpen, selected, setDeleteOpen, deleteUser } = useUsers()

  return (
    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <DialogContent className="rounded-2xl max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-medium">{t('users_delete')}</DialogTitle>
          <DialogDescription className="font-light">
            {t('confirm_delete')} <strong>{selected?.email}</strong>? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>{t('cancel')}</Button>
          <Button variant="destructive" onClick={deleteUser}>{t('delete')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
