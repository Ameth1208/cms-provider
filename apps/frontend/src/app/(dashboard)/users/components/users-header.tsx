'use client'

import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
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
    <PageHeader title={t('users_title')} description={t('users_description')}>
      {canManage && (
        <Button onClick={() => { resetForm(); setCreateOpen(true) }}>
          <UserPlus className="h-4 w-4 mr-2" />
          {t('users_invite')}
        </Button>
      )}
    </PageHeader>
  )
}
