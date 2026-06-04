'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useTranslation } from '@/i18n/use-translation'
import { useUsers } from '../hooks/use-users'

export function UserDeleteDialog() {
  const { t } = useTranslation()
  const { deleteOpen, selected, setDeleteOpen, deleteUser } = useUsers()

  return (
    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <DialogContent className="rounded-2xl max-w-md">
        <DialogHeader className="gap-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <div className="text-center">
            <DialogTitle className="text-lg font-semibold">{t('users_delete')}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              {t('users_delete_confirm', { email: selected?.email || '' })}
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="flex justify-center gap-3 pt-4">
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>{t('cancel')}</Button>
          <Button variant="destructive" onClick={deleteUser}>{t('delete')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
