'use client'

import { ContentCanvas } from './components/content-canvas'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/react'
import { useState } from 'react'
import { CreateSectionDialog } from './components/create-section-dialog'
import { useTranslation } from '@/i18n/use-translation'
import { ContentProvider } from './hooks/use-content'

export default function ContentPage() {
  const { t } = useTranslation()
  const [createSectionOpen, setCreateSectionOpen] = useState(false)

  return (
    <ContentProvider>
      <div className="space-y-6">
        <PageHeader
          title={t('content')}
          description={t('content_desc')}
        >
          <Button size="sm" onClick={() => setCreateSectionOpen(true)}>
            <Icon icon="lucide:plus" className="h-4 w-4 mr-1.5" />
            {t('content_new_section')}
          </Button>
        </PageHeader>

        <ContentCanvas 
          onCreateSection={() => setCreateSectionOpen(true)} 
        />

        <CreateSectionDialog
          open={createSectionOpen}
          onOpenChange={setCreateSectionOpen}
          onSuccess={() => {}}
        />
      </div>
    </ContentProvider>
  )
}
