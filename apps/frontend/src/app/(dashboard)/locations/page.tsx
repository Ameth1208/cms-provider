'use client'

import { useState } from 'react'
import { useTranslation } from '@/i18n/use-translation'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Icon } from '@iconify/react'
import { MapView } from '@/components/map-view'
import { useLocations } from './hooks/use-locations'
import { LocationsTable } from './components/locations-table'
import { CreateLocationDialog } from './components/create-location-dialog'

export default function LocationsPage() {
  const { t } = useTranslation()
  const { locations, loading, saving, createLocation, updateLocation, deleteLocation } = useLocations()
  const [createOpen, setCreateOpen] = useState(false)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  const mapMarkers = locations.map((loc) => ({
    id: loc.id,
    name: loc.name,
    address: loc.address,
    latitude: loc.latitude || 0,
    longitude: loc.longitude || 0,
  }))

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title={t('locations_title')}
        description={`${locations.length} sedes`}
      >
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Icon icon="lucide:plus" className="h-4 w-4" />
          {t('locations_create')}
        </Button>
      </PageHeader>

      {locations.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <MapView markers={mapMarkers} height="300px" />
          </CardContent>
        </Card>
      )}

      <CreateLocationDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={createLocation}
        saving={saving}
      />

      <LocationsTable
        locations={locations}
        onToggleMain={updateLocation}
        onDelete={deleteLocation}
      />
    </div>
  )
}
