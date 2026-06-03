'use client'

import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useSettings } from '../hooks/use-settings'

export function SettingsForm() {
  const { form, loading, saving, handleChange, handleSave } = useSettings()

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase mb-3">
          Configuración
        </p>
        <h1 className="text-3xl sm:text-4xl font-light text-foreground tracking-tight">
          Ajustes de empresa
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del negocio</CardTitle>
          <CardDescription>Nombre y logo de tu empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Nombre de la empresa
            </Label>
            <Input
              id="companyName"
              value={form.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="Mi Empresa"
              className="font-light"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logoUrl" className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              URL del logo
            </Label>
            <Input
              id="logoUrl"
              value={form.logoUrl || ''}
              onChange={(e) => handleChange('logoUrl', e.target.value || null)}
              placeholder="https://ejemplo.com/logo.png"
              className="font-light"
            />
            {form.logoUrl && (
              <img src={form.logoUrl} alt="logo" className="h-12 mt-2 object-contain rounded-xl border" />
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="px-6">
          {saving ? (
            <Icon icon="lucide:loader-circle" className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icon icon="lucide:save" className="mr-2 h-4 w-4" />
          )}
          Guardar cambios
        </Button>
      </div>
    </div>
  )
}
