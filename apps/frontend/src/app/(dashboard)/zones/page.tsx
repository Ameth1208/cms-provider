'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useZones } from './hooks/use-zones'
import { ZoneMap } from './components/zone-map'
import { ZonesTable } from './components/zones-table'
import { CreateZoneDialog } from './components/create-zone-dialog'

export default function ZonesPage() {
  const { t } = useTranslation()
  const { zones, loading, saving, createZone, deleteZone } = useZones()
  const [createOpen, setCreateOpen] = useState(false)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title={t('zones_title')}
        description={`${zones.length} zonas`}
      >
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Icon icon="lucide:plus" className="h-4 w-4" />
          {t('zones_create')}
        </Button>
      </PageHeader>

      {zones.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <ZoneMap zones={zones} height="350px" />
          </CardContent>
        </Card>
      )}

      <CreateZoneDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={createZone}
        saving={saving}
      />

      <ZonesTable zones={zones} onDelete={deleteZone} />
    </div>
  )
}
