'use client'

import { useCampaigns } from '../hooks/use-campaigns'

export function CampaignsList() {
  const { campaigns, toggleActive } = useCampaigns()

  if (campaigns.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No hay campañas</p>
  }

  return (
    <div className="grid gap-4">
      {campaigns.map((camp) => (
        <div key={camp.id} className="bg-background rounded-xl border p-4 flex items-center justify-between">
          <div>
            <h3 className="font-medium">{camp.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(camp.startDate).toLocaleDateString()} — {new Date(camp.endDate).toLocaleDateString()}
              {camp.autoApply && ' · Auto-aplicable'}
            </p>
            {camp.discounts.map((d) => (
              <span key={d.id} className="text-xs px-2 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full mr-1">
                {d.type === 'PERCENTAGE' ? `${d.value}%` : `$${d.value}`}
                {d.code && ` (${d.code})`}
              </span>
            ))}
          </div>
          <button
            onClick={() => toggleActive(camp.id)}
            className={`px-3 py-1 rounded-lg text-xs font-medium ${camp.active ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/15 text-red-600 dark:text-red-400'}`}
          >
            {camp.active ? 'Activa' : 'Inactiva'}
          </button>
        </div>
      ))}
    </div>
  )
}
