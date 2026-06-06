'use client'

import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/i18n/use-translation'
import { useSettings } from '../hooks/use-settings'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ImageUpload } from '@/components/ui/image-upload'

export function SettingsForm() {
  const { t } = useTranslation()
  const { form, loading, saving, handleChange, handleSave, uploadLogo } = useSettings()

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
      <Alert className="bg-muted/50 border-muted">
        <Icon icon="lucide:info" className="h-4 w-4 text-muted-foreground" />
        <AlertDescription className="text-sm text-muted-foreground">
          {t('settings_sidebar_info')}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings_business_info')}</CardTitle>
          <CardDescription>{t('settings_business_info_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {t('settings_company_name')}
            </Label>
            <Input
              id="companyName"
              value={form.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder={t('settings_company_name_placeholder')}
              className="font-light"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {t('settings_logo_url')}
            </Label>
            <ImageUpload
              value={form.logoUrl}
              onChange={(url) => handleChange('logoUrl', url)}
              onUpload={uploadLogo}
            />
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
          {t('save')}
        </Button>
      </div>
    </div>
  )
}
