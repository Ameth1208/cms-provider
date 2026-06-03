'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'
import { useCatalog } from './hooks/use-catalog'
import { CatalogCardGrid } from './components/catalog-card-grid'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/i18n/use-translation'
import type { Category, Tag } from '@cms/shared'

export default function CatalogPage() {
  const { token } = useAuth()
  const { t } = useTranslation()
  const { items, loading, fetchItems, deleteItem } = useCatalog()

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'ALL' | 'PRODUCT' | 'SERVICE'>('ALL')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [filterCategory, setFilterCategory] = useState<string>('ALL')
  const [filterTag, setFilterTag] = useState<string>('ALL')
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])

  useEffect(() => {
    if (!token) return
    Promise.all([
      api.get<Category[]>('/catalog/categories/all', token),
      api.get<Tag[]>('/catalog/tags/all', token),
    ]).then(([cats, tgs]) => {
      setCategories(cats)
      setTags(tgs)
    })
  }, [token])

  useEffect(() => {
    const params: Record<string, string> = {}
    if (search) params.search = search
    if (filterType !== 'ALL') params.type = filterType
    if (filterCategory !== 'ALL') params.categoryId = filterCategory
    if (filterTag !== 'ALL') params.tagId = filterTag
    fetchItems(Object.keys(params).length ? params : undefined)
  }, [fetchItems, search, filterType, filterCategory, filterTag])

  const filteredItems = items.filter((item) => {
    if (filterStatus === 'ACTIVE') return item.active
    if (filterStatus === 'INACTIVE') return !item.active
    return true
  })

  const activeFiltersCount = [
    filterType !== 'ALL',
    filterStatus !== 'ALL',
    filterCategory !== 'ALL',
    filterTag !== 'ALL',
    search !== '',
  ].filter(Boolean).length

  const typeOptions = [
    { key: 'ALL' as const, label: t('all_types'), icon: 'lucide:layout-grid' },
    { key: 'PRODUCT' as const, label: t('type_product'), icon: 'lucide:package' },
    { key: 'SERVICE' as const, label: t('type_service'), icon: 'lucide:concierge-bell' },
  ]

  const statusOptions = [
    { key: 'ALL' as const, label: t('all_statuses') },
    { key: 'ACTIVE' as const, label: t('active') },
    { key: 'INACTIVE' as const, label: t('inactive') },
  ]

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
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

      {/* Filter bar */}
      <div className="rounded-xl bg-card p-4 space-y-4">
        {/* Search + Type pills */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-1">
            {typeOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFilterType(opt.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  filterType === opt.key
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon icon={opt.icon} className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Second row: Status, Category, Tag, Clear */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status */}
          <div className="flex items-center gap-1">
            {statusOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFilterStatus(opt.key)}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                  filterStatus === opt.key
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <span className="text-muted-foreground/30 hidden sm:inline">·</span>

          {/* Category */}
          {categories.length > 0 && (
            <div className="flex items-center gap-1.5 max-w-[280px]">
              <Icon icon="lucide:folder" className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-7 px-2 rounded-md border-0 bg-transparent text-[11px] text-muted-foreground hover:text-foreground cursor-pointer focus:ring-0 focus:outline-none appearance-none pr-6"
                style={{ backgroundImage: 'none' }}
              >
                <option value="ALL">{t('all_categories')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}

          <span className="text-muted-foreground/30 hidden sm:inline">·</span>

          {/* Tag */}
          {tags.length > 0 && (
            <div className="flex items-center gap-1.5 max-w-[280px]">
              <Icon icon="lucide:tag" className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="h-7 px-2 rounded-md border-0 bg-transparent text-[11px] text-muted-foreground hover:text-foreground cursor-pointer focus:ring-0 focus:outline-none appearance-none pr-6"
                style={{ backgroundImage: 'none' }}
              >
                <option value="ALL">{t('all_tags')}</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
            </div>
          )}

          {activeFiltersCount > 0 && (
            <>
              <span className="text-muted-foreground/30 hidden sm:inline">·</span>
              <button
                type="button"
                onClick={() => {
                  setFilterType('ALL')
                  setFilterStatus('ALL')
                  setFilterCategory('ALL')
                  setFilterTag('ALL')
                  setSearch('')
                }}
                className="flex items-center gap-1 text-[11px] text-destructive hover:text-destructive/80 transition-colors"
              >
                <Icon icon="lucide:rotate-ccw" className="h-3 w-3" />
                {t('clear_filters')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-card overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <CatalogCardGrid items={filteredItems} onDelete={deleteItem} />
      )}
    </div>
  )
}
