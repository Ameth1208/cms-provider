'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api-client'
import type { Campaign } from '@cms/shared'

export default function CampaignsPage() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    if (!token) return
    api.get<Campaign[]>('/campaigns', token).then(setCampaigns)
  }, [token])

  async function toggleActive(id: string) {
    if (!token) return
    const updated = await api.post<Campaign>(`/campaigns/${id}/toggle`, {}, token)
    setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Campañas</h1>
        <Link
          href="/campaigns/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
        >
          + Nueva campaña
        </Link>
      </div>

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
                <span key={d.id} className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full mr-1">
                  {d.type === 'PERCENTAGE' ? `${d.value}%` : `$${d.value}`}
                  {d.code && ` (${d.code})`}
                </span>
              ))}
            </div>
            <button
              onClick={() => toggleActive(camp.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium ${camp.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
            >
              {camp.active ? 'Activa' : 'Inactiva'}
            </button>
          </div>
        ))}
        {campaigns.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No hay campañas</p>
        )}
      </div>
    </div>
  )
}
