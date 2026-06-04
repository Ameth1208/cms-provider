'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { useCatalogFilters } from '../hooks/use-catalog-filters'
import { useTranslation } from '@/i18n/use-translation'

export function CatalogHeader() {
  const { t } = useTranslation()
  const { filteredItems, activeFiltersCount } = useCatalogFilters()

  const description = `${filteredItems.length} ${filteredItems.length === 1 ? 'producto' : 'productos'}${activeFiltersCount > 0 ? ` · ${activeFiltersCount} filtro${activeFiltersCount > 1 ? 's' : ''}` : ''}`

  return (
    <PageHeader title={t('title')} description={description}>
      <Link href="/catalog/create">
        <Button className="gap-2">
          <Icon icon="lucide:plus" className="h-4 w-4" />
          <span className="hidden sm:inline">{t('new_item')}</span>
        </Button>
      </Link>
    </PageHeader>
  )
}
