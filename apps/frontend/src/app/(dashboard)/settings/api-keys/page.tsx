'use client'

import { useEffect } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useApiKeys } from './hooks/useApiKeys'
import { useApiKeysStore } from './store/api-keys-store'
import { ApiKeysTable } from './components/api-keys-table'
import { ApiKeysDialogs } from './components/api-keys-dialogs'
import { ApiKeyRegenerateDialog } from './components/api-key-regenerate-dialog'
import { PageHeader } from '@/components/page-header'
import { useTranslation } from '@/i18n/use-translation'

function ApiKeysTableWrapper() {
  const { fetchKeys } = useApiKeys()
  useEffect(() => { fetchKeys() }, [fetchKeys])
  return (
    <>
      <ApiKeysTable />
      <ApiKeysDialogs />
      <ApiKeyRegenerateDialog />
    </>
  )
}

export default function ApiKeysPage() {
  const setCreateOpen = useApiKeysStore((s) => s.setCreateOpen)
  const resetForm = useApiKeysStore((s) => s.resetForm)
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('api_keys')}
        description={t('api_keys_desc')}
      >
        <Button onClick={() => { resetForm(); setCreateOpen(true) }}>
          <Icon icon="lucide:plus" className="h-4 w-4 mr-2" />
          {t('api_keys_create')}
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          <ApiKeysTableWrapper />
        </CardContent>
      </Card>
    </div>
  )
}
