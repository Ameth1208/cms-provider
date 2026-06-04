'use client'

import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { useAuth } from '@/lib/auth-context'
import { useTranslation } from '@/i18n/use-translation'
import { useCustomers } from '../hooks/use-customers'

export function CustomersHeader() {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  const { setCreateOpen, resetForm } = useCustomers()

  return (
    <PageHeader title={t('customers_title')} description={t('customers_description')}>
      <Button onClick={() => { resetForm(); setCreateOpen(true) }}>
        <UserPlus className="h-4 w-4 mr-2" />
        {t('customers_create')}
      </Button>
    </PageHeader>
  )
}
