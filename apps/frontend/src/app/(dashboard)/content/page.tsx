'use client'

import { ContentBuilder } from './components/content-builder'
import { PageHeader } from '@/components/page-header'
import { useTranslation } from '@/i18n/use-translation'

export default function ContentPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('content')}
        description={t('content_desc')}
      />

      <ContentBuilder />
    </div>
  )
}
