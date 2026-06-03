'use client'

import { useEffect } from 'react'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useApiKeys } from './hooks/useApiKeys'
import { useApiKeysStore } from './store/api-keys-store'
import { ApiKeysTable } from './components/api-keys-table'
import { ApiKeysDialogs } from './components/api-keys-dialogs'

function ApiKeysTableWrapper() {
  const { fetchKeys } = useApiKeys()
  useEffect(() => { fetchKeys() }, [fetchKeys])
  return (
    <>
      <ApiKeysTable />
      <ApiKeysDialogs />
    </>
  )
}

export default function ApiKeysPage() {
  const setCreateOpen = useApiKeysStore((s) => s.setCreateOpen)
  const resetForm = useApiKeysStore((s) => s.resetForm)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">API Keys</h1>
          <p className="text-sm text-muted-foreground font-light mt-1">
            Claves de acceso para servicios externos
          </p>
        </div>
        <Button onClick={() => { resetForm(); setCreateOpen(true) }}>
          <Icon icon="lucide:plus" className="h-4 w-4 mr-2" />
          Crear API Key
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 pt-4">
          <ApiKeysTableWrapper />
        </CardContent>
      </Card>
    </div>
  )
}
