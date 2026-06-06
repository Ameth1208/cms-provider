'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useTranslation } from '@/i18n/use-translation'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useReturns } from './hooks/use-returns'
import { ReturnsStats } from './components/returns-stats'
import { ReturnsTable } from './components/returns-table'

export default function ReturnsPage() {
  const { t } = useTranslation()
  const { returns, stats, loading, updateStatus, deleteReturn } = useReturns()

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title={t('returns_title')}
        description={`${stats.total} ${t('returns').toLowerCase()}`}
      >
        <Button className="gap-2">
          <Icon icon="lucide:plus" className="h-4 w-4" />
          {t('returns_create')}
        </Button>
      </PageHeader>

      <ReturnsStats stats={stats} />

      <ReturnsTable
        returns={returns}
        onUpdateStatus={updateStatus}
        onDelete={deleteReturn}
      />
    </div>
  )
}
