'use client'

import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { api } from '@/lib/api-client'
import { Card, CardContent } from '@/components/ui/card'

export default function DashboardPage() {
  const { token } = useAuth()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    if (!token) return

    api.get('/orders/stats', token)
      .then(setStats)
      .catch(() => {})
  }, [token])

  const cards = [
    { label: 'Total Pedidos', value: stats?.totalOrders ?? '—', icon: 'lucide:shopping-cart' },
    { label: 'Pendientes', value: stats?.pendingOrders ?? '—', icon: 'lucide:clock' },
    { label: 'Ingresos', value: stats ? `$${stats.totalRevenue.toFixed(2)}` : '—', icon: 'lucide:trending-up' },
  ]

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase mb-3">
          Panel principal
        </p>
        <h1 className="text-3xl sm:text-4xl font-light text-foreground tracking-tight">
          Resumen del negocio
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Card key={card.label} className="hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-light text-muted-foreground tracking-tight">
                  {card.label}
                </p>
                <Icon icon={card.icon} className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-light tracking-tight">
                {card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
