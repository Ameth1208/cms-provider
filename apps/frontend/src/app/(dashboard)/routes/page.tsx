'use client'

import { useState, useEffect, useCallback } from 'react'
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
} from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'

interface Route {
  id: string
  name: string
  driverId: string
  driver: { name: string }
  date: string
  status: string
  orderIds: string[]
  startedAt?: string
  completedAt?: string
}

export default function RoutesPage() {
  const { t } = useTranslation()
  const { token } = useAuth()
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', driverId: '' })

  const fetchRoutes = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await api.get<Route[]>('/delivery-routes', token)
      setRoutes(data)
    } catch (err) {
      console.error('Failed to fetch routes:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchRoutes()
  }, [fetchRoutes])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    try {
      await api.post('/delivery-routes', formData, token)
      setCreateOpen(false)
      setFormData({ name: '', driverId: '' })
      await fetchRoutes()
    } catch (err) {
      console.error('Failed to create route:', err)
    }
  }

  const handleStart = async (id: string) => {
    if (!token) return
    try {
      await api.post(`/delivery-routes/${id}/start`, {}, token)
      await fetchRoutes()
    } catch (err) {
      console.error('Failed to start route:', err)
    }
  }

  const handleComplete = async (id: string) => {
    if (!token) return
    try {
      await api.post(`/delivery-routes/${id}/complete`, {}, token)
      await fetchRoutes()
    } catch (err) {
      console.error('Failed to complete route:', err)
    }
  }

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
        title={t('routes_title')}
        description={`${routes.length} rutas`}
      >
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Icon icon="lucide:plus" className="h-4 w-4" />
          {t('routes_create')}
        </Button>
      </PageHeader>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-medium">{t('routes_create')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>{t('cancel')}</Button>
              <Button type="submit">{t('create')}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {routes.map((route) => (
          <Card key={route.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{route.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {route.driver?.name} • {new Date(route.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {route.orderIds.length} pedidos
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={route.status === 'COMPLETED' ? 'default' : 'secondary'}>
                    {route.status}
                  </Badge>
                  
                  {route.status === 'PLANNED' && (
                    <Button size="sm" onClick={() => handleStart(route.id)}>
                      {t('start_route')}
                    </Button>
                  )}
                  
                  {route.status === 'IN_PROGRESS' && (
                    <Button size="sm" onClick={() => handleComplete(route.id)}>
                      {t('complete_route')}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
