'use client'

import { AlertTriangle, ShieldCheck } from 'lucide-react'
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
      <DialogContent className="rounded-2xl max-w-md">
        <DialogHeader className="gap-4">
          <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${isBlocking ? 'bg-orange-100' : 'bg-green-100'}`}>
            {isBlocking ? (
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            ) : (
              <ShieldCheck className="h-6 w-6 text-green-600" />
            )}
          </div>
          <div className="text-center">
            <DialogTitle className="text-lg font-semibold">
              {isBlocking ? t('users_block') : t('users_activate')}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              {isBlocking
                ? t('users_confirm_block', { name: user?.name || user?.email || '' })
                : t('users_confirm_activate', { name: user?.name || user?.email || '' })}
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="flex justify-center gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button 
            variant={isBlocking ? 'destructive' : 'default'} 
            onClick={onConfirm}
            className={isBlocking ? '' : 'bg-green-600 hover:bg-green-700'}
          >
            {isBlocking ? t('users_block_action') : t('users_activate_action')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
