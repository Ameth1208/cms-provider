'use client'

import { useEffect } from 'react'
import { useInventory } from './hooks/use-inventory'
import { useInventoryStore } from './store/inventory-store'
import { InventoryList } from './components/inventory-list'
import { InventoryDetail } from './components/inventory-detail'
import { BatchForm } from './components/batch-form'
import { PageSkeleton } from '@/components/skeletons'
import { PageHeader } from '@/components/page-header'
import { useTranslation } from '@/i18n/use-translation'

export default function InventoryPage() {
  const { fetchItems } = useInventory()
  const { t } = useTranslation()
  const loading = useInventoryStore((s) => s.loading)
  const items = useInventoryStore((s) => s.items)
  const detailOpen = useInventoryStore((s) => s.detailOpen)
  const batchFormOpen = useInventoryStore((s) => s.batchFormOpen)

  useEffect(() => { fetchItems() }, [fetchItems])

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('inventory')}
        description={t('inventory_desc')}
      />

      {loading && items.length === 0 ? (
        <PageSkeleton />
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">No hay inventario</div>
      ) : (
        <InventoryList />
      )}

      {detailOpen && <InventoryDetail />}
      {batchFormOpen && <BatchForm />}
    </div>
  )
}
