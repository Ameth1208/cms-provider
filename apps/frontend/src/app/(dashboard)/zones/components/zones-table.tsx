'use client'

import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Zone {
  id: string
  name: string
  coordinates: string
  shippingCost: number
  estimatedDays: number
  color: string
}

interface Props {
  zones: Zone[]
  onDelete: (id: string) => Promise<void>
}

export function ZonesTable({ zones, onDelete }: Props) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="text-xs tracking-wider uppercase">{t('zones_name')}</TableHead>
              <TableHead className="text-xs tracking-wider uppercase">{t('zones_cost')}</TableHead>
              <TableHead className="text-xs tracking-wider uppercase">{t('zones_days')}</TableHead>
              <TableHead className="text-right text-xs tracking-wider uppercase">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zones.map((zone) => (
              <TableRow key={zone.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded border border-border"
                      style={{ backgroundColor: zone.color }}
                    />
                    <span className="font-medium">{zone.name}</span>
                  </div>
                </TableCell>
                <TableCell>${zone.shippingCost.toFixed(2)}</TableCell>
                <TableCell>{zone.estimatedDays} {t('days')}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => {
                      if (confirm(t('zones_delete_confirm'))) onDelete(zone.id)
                    }}
                  >
                    <Icon icon="lucide:trash-2" className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
