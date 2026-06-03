'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { useCatalogFilters } from '../hooks/use-catalog-filters'
import { useTranslation } from '@/i18n/use-translation'

export function CatalogHeader() {
  const { t } = useTranslation()
  const { filteredItems, activeFiltersCount } = useCatalogFilters()

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {filteredItems.length} {filteredItems.length === 1 ? 'producto' : 'productos'}
          {activeFiltersCount > 0 && (
            <span className="text-muted-foreground"> · {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''}</span>
          )}
        </p>
      </div>
      <Link href="/catalog/create">
        <Button className="gap-2">
          <Icon icon="lucide:plus" className="h-4 w-4" />
          <span className="hidden sm:inline">{t('new_item')}</span>
        </Button>
      </Link>
    </div>
  )
}
