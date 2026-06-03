'use client'

import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { useTranslation } from '@/i18n/use-translation'
import { useUsers } from '../hooks/use-users'

export function UsersHeader() {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  const { setCreateOpen, resetForm } = useUsers()

  const canManage = currentUser?.permissions.some(
    (p) => p.resource === 'users' && (p.action === 'create' || p.action === 'manage'),
  )

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">{t('users_title')}</h1>
        <p className="text-sm text-muted-foreground font-light mt-1">{t('users_description')}</p>
      </div>
      {canManage && (
        <Button onClick={() => { resetForm(); setCreateOpen(true) }}>
          <Icon icon="lucide:user-plus" className="h-4 w-4 mr-2" />
          {t('users_invite')}
        </Button>
      )}
    </div>
  )
}
