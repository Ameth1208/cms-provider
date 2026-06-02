'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Icon } from '@iconify/react'
import { api } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import type { ThemeSettings } from '@cms/shared'
import { useApiKeys } from '../api-keys/hooks/useApiKeys'
import { useApiKeysStore } from '../api-keys/store/api-keys-store'
import { ApiKeysTable } from '../api-keys/components/api-keys-table'
import { ApiKeysDialogs } from '../api-keys/components/api-keys-dialogs'

function ApiKeysTableWrapper() {
  const { fetchKeys } = useApiKeys()

  useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

  return (
    <>
      <ApiKeysTable />
      <ApiKeysDialogs />
    </>
  )
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ThemeSettings>({
    companyName: '',
    primaryColor: '#000000',
    secondaryColor: '#f1f5f9',
    accentColor: '#f1f5f9',
    fontFamily: 'var(--font-poppins)',
    logoUrl: null,
  })

  useEffect(() => {
    if (!token) return
    api.get<ThemeSettings>('/settings', token)
      .then((data) => {
        setForm(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  function handleChange(key: keyof ThemeSettings, value: string | null) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!token) return
    setSaving(true)
    try {
      const updated = await api.put<ThemeSettings>('/settings', form, token)
      setForm(updated)
    } finally {
      setSaving(false)
    }
  }

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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Claves de acceso para servicios externos</CardDescription>
            </div>
            <Button
              onClick={() => { useApiKeysStore.getState().resetForm(); useApiKeysStore.getState().setCreateOpen(true) }}
              className="rounded-full px-5"
            >
              <Icon icon="lucide:plus" className="mr-2 h-4 w-4" />
              Crear API Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ApiKeysTableWrapper />
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
