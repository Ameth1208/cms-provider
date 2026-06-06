'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDrivers } from './hooks/use-drivers'

export default function DriversPage() {
  const { t } = useTranslation()
  const { drivers, loading, saving, createDriver, updateDriver, deleteDriver } = useDrivers()
  const [createOpen, setCreateOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    vehicleType: '',
    licensePlate: '',
    active: true,
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createDriver(formData)
    setCreateOpen(false)
    setFormData({ name: '', email: '', phone: '', licenseNumber: '', vehicleType: '', licensePlate: '', active: true })
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title={t('drivers_title')}
        description={`${drivers.length} ${drivers.length === 1 ? t('driver_count') : t('drivers_count')}`}
      >
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Icon icon="lucide:plus" className="h-4 w-4" />
          {t('drivers_create')}
        </Button>
      </PageHeader>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-medium">{t('drivers_create')}</DialogTitle>
            <DialogDescription className="font-light">{t('drivers_create_desc')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {[
              { key: 'name' as const, label: t('drivers_name'), required: true },
              { key: 'email' as const, label: t('drivers_email'), type: 'email' },
              { key: 'phone' as const, label: t('drivers_phone'), required: true },
              { key: 'licenseNumber' as const, label: t('drivers_license') },
              { key: 'vehicleType' as const, label: t('drivers_vehicle') },
              { key: 'licensePlate' as const, label: t('drivers_plate') },
            ].map((field) => (
              <div key={field.key} className="space-y-2">
                <Label>{field.label}</Label>
                <Input
                  value={formData[field.key]}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  type={field.type || 'text'}
                  required={field.required}
                />
              </div>
            ))}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>{t('cancel')}</Button>
              <Button type="submit" disabled={saving}>{t('create')}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {drivers.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Icon icon="lucide:truck" className="mx-auto h-10 w-10 mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground font-light">{t('drivers_empty')}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('drivers_empty_desc')}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead className="text-xs tracking-wider uppercase">{t('drivers_name')}</TableHead>
                  <TableHead className="text-xs tracking-wider uppercase">{t('drivers_phone')}</TableHead>
                  <TableHead className="text-xs tracking-wider uppercase">{t('drivers_vehicle')}</TableHead>
                  <TableHead className="text-xs tracking-wider uppercase">{t('drivers_status')}</TableHead>
                  <TableHead className="text-xs tracking-wider uppercase">{t('drivers_orders')}</TableHead>
                  <TableHead className="text-right text-xs tracking-wider uppercase">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon icon="lucide:user" className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{driver.name}</p>
                          {driver.email && <p className="text-xs text-muted-foreground">{driver.email}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{driver.phone}</TableCell>
                    <TableCell>
                      {driver.vehicleType || driver.licensePlate ? (
                        <div>
                          {driver.vehicleType && <p className="text-sm">{driver.vehicleType}</p>}
                          {driver.licensePlate && <p className="text-xs text-muted-foreground">{driver.licensePlate}</p>}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={driver.active ? 'default' : 'secondary'}>
                        {driver.active ? t('drivers_active') : t('drivers_inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{driver._count?.orders || 0}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateDriver(driver.id, { active: !driver.active })}
                        >
                          <Icon icon={driver.active ? 'lucide:pause' : 'lucide:play'} className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => {
                            if (confirm(t('drivers_delete_confirm'))) deleteDriver(driver.id)
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
      )}
    </div>
  )
}
