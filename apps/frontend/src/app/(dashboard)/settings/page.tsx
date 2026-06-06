'use client'

import { Icon } from '@iconify/react'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/page-header'
import { useTranslation } from '@/i18n/use-translation'
import { useSettings } from './hooks/use-settings'
import { SettingsForm } from './components/settings-form'

export default function SettingsPage() {
  const { t } = useTranslation()
  const { form, loading } = useSettings()

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title={t('settings_title')}
        description={t('settings_business_info_desc')}
      >
        {form.companyName && (
          <Badge variant="secondary" className="gap-1.5 px-2.5 py-1">
            <Icon icon="lucide:building-2" className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{form.companyName}</span>
          </Badge>
        )}
      </PageHeader>

      <SettingsForm />
    </div>
  )
}
