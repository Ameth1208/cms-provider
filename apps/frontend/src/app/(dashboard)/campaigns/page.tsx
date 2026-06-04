'use client'

import { useEffect } from 'react'
import { useCampaigns } from './hooks/use-campaigns'
import { CampaignsList } from './components/campaigns-list'
import { PageHeader } from '@/components/page-header'
import { useTranslation } from '@/i18n/use-translation'

export default function CampaignsPage() {
  const { fetchCampaigns } = useCampaigns()
  const { t } = useTranslation()

  useEffect(() => { fetchCampaigns() }, [fetchCampaigns])

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('campaigns')}
        description={t('campaigns_desc')}
      />
      <CampaignsList />
    </div>
  )
}
