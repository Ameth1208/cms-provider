'use client'

import { useCatalogStore } from './store/catalog-store'
import { useCatalogInit } from './hooks/use-catalog-init'
import { CatalogHeader } from './components/catalog-header'
import { CatalogFilters } from './components/catalog-filters'
import { CatalogCardGrid } from './components/catalog-card-grid'
import { CatalogSkeleton } from './components/catalog-skeleton'

export default function CatalogPage() {
  useCatalogInit()
  const loading = useCatalogStore((s) => s.loading)

  return (
    <div className="space-y-6 pb-10">
      <CatalogHeader />
      <CatalogFilters />
      {loading ? <CatalogSkeleton /> : <CatalogCardGrid />}
    </div>
  )
}
