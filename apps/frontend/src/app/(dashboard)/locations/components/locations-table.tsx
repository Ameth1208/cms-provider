'use client'

import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Location {
  id: string
  name: string
  address: string
  city?: string
  state?: string
  phone?: string
  isMain: boolean
}

interface Props {
  locations: Location[]
  onToggleMain: (id: string, data: { isMain: boolean }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function LocationsTable({ locations, onToggleMain, onDelete }: Props) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="text-xs tracking-wider uppercase">{t('locations_name')}</TableHead>
              <TableHead className="text-xs tracking-wider uppercase">{t('locations_address')}</TableHead>
              <TableHead className="text-xs tracking-wider uppercase">{t('locations_phone')}</TableHead>
              <TableHead className="text-xs tracking-wider uppercase">{t('locations_main')}</TableHead>
              <TableHead className="text-right text-xs tracking-wider uppercase">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((location) => (
              <TableRow key={location.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:building" className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{location.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{location.address}</p>
                    <p className="text-xs text-muted-foreground">
                      {location.city}{location.city && location.state && ', '}{location.state}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{location.phone || '-'}</TableCell>
                <TableCell>
                  {location.isMain && (
                    <Badge variant="default">{t('locations_main')}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleMain(location.id, { isMain: !location.isMain })}
                    >
                      <Icon
                        icon={location.isMain ? 'lucide:star-off' : 'lucide:star'}
                        className="h-4 w-4"
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => {
                        if (confirm(t('locations_delete_confirm'))) {
                          onDelete(location.id)
                        }
                      }}
                    >
                      <Icon icon="lucide:trash-2" className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
