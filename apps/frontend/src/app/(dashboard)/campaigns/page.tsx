'use client'

import { useEffect } from 'react'
import { useCampaigns } from './hooks/use-campaigns'
import { CampaignsList } from './components/campaigns-list'

export default function CampaignsPage() {
  const { fetchCampaigns } = useCampaigns()

  useEffect(() => { fetchCampaigns() }, [fetchCampaigns])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Campañas</h1>
        <p className="text-sm text-muted-foreground font-light mt-1">Descuentos y promociones</p>
      </div>
      <CampaignsList />
    </div>
  )
}
