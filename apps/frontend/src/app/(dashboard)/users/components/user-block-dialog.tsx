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
import type { UserRecord } from '../store/users-store'

interface Props {
  user: UserRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function UserBlockDialog({ user, open, onOpenChange, onConfirm }: Props) {
  const { t } = useTranslation()
  const isBlocking = user?.active ?? true

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-medium">
            {isBlocking ? t('users_block') : t('users_activate')}
          </DialogTitle>
          <DialogDescription className="font-light">
            {isBlocking
              ? t('users_confirm_block', { name: user?.name || user?.email || '' })
              : t('users_confirm_activate', { name: user?.name || user?.email || '' })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button variant={isBlocking ? 'destructive' : 'default'} onClick={onConfirm}>
            {isBlocking ? t('users_block_action') : t('users_activate_action')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
