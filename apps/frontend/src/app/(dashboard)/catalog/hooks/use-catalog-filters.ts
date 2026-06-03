'use client'

import { useMemo } from 'react'
import { useTranslation } from '@/i18n/use-translation'
import { useCatalogStore } from '../store/catalog-store'

export function useCatalogFilters() {
  const { t } = useTranslation()

  const search = useCatalogStore((s) => s.search)
  const setSearch = useCatalogStore((s) => s.setSearch)
  const filterType = useCatalogStore((s) => s.filterType)
  const setFilterType = useCatalogStore((s) => s.setFilterType)
  const filterStatus = useCatalogStore((s) => s.filterStatus)
  const setFilterStatus = useCatalogStore((s) => s.setFilterStatus)
  const filterCategory = useCatalogStore((s) => s.filterCategory)
  const setFilterCategory = useCatalogStore((s) => s.setFilterCategory)
  const filterTag = useCatalogStore((s) => s.filterTag)
  const setFilterTag = useCatalogStore((s) => s.setFilterTag)
  const clearFilters = useCatalogStore((s) => s.clearFilters)

  const items = useCatalogStore((s) => s.items)

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filterStatus === 'ACTIVE') return item.active
      if (filterStatus === 'INACTIVE') return !item.active
      return true
    })
  }, [items, filterStatus])

  const activeFiltersCount = useMemo(() => {
    return [
      filterType !== 'ALL',
      filterStatus !== 'ALL',
      filterCategory !== 'ALL',
      filterTag !== 'ALL',
      search !== '',
    ].filter(Boolean).length
  }, [filterType, filterStatus, filterCategory, filterTag, search])

  const typeOptions = useMemo(() => [
    { key: 'ALL' as const, label: t('all_types'), icon: 'lucide:layout-grid' },
    { key: 'PRODUCT' as const, label: t('type_product'), icon: 'lucide:package' },
    { key: 'SERVICE' as const, label: t('type_service'), icon: 'lucide:concierge-bell' },
  ], [t])

  const statusOptions = useMemo(() => [
    { key: 'ALL' as const, label: t('all_statuses') },
    { key: 'ACTIVE' as const, label: t('active') },
    { key: 'INACTIVE' as const, label: t('inactive') },
  ], [t])

  return {
    search, setSearch,
    filterType, setFilterType,
    filterStatus, setFilterStatus,
    filterCategory, setFilterCategory,
    filterTag, setFilterTag,
    filteredItems,
    activeFiltersCount,
    typeOptions,
    statusOptions,
    clearFilters,
  }
}
