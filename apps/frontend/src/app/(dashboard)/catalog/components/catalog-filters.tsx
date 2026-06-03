'use client'

import { Icon } from '@iconify/react'
import { Input } from '@/components/ui/input'
import { useCatalogStore } from '../store/catalog-store'
import { useCatalogFilters } from '../hooks/use-catalog-filters'

export function CatalogFilters() {
  const {
    search, setSearch,
    filterType, setFilterType,
    filterStatus, setFilterStatus,
    filterCategory, setFilterCategory,
    filterTag, setFilterTag,
    activeFiltersCount,
    typeOptions,
    statusOptions,
    clearFilters,
  } = useCatalogFilters()

  const categories = useCatalogStore((s) => s.categories)
  const tags = useCatalogStore((s) => s.tags)

  return (
    <div className="rounded-xl bg-card p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar..."
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
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${filterType === opt.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon icon={opt.icon} className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          {statusOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setFilterStatus(opt.key)}
              className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${filterStatus === opt.key ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <span className="text-muted-foreground/30 hidden sm:inline">·</span>

        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 max-w-[280px]">
            <Icon icon="lucide:folder" className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="h-7 px-2 rounded-md border-0 bg-transparent text-[11px] text-muted-foreground hover:text-foreground cursor-pointer focus:ring-0 focus:outline-none appearance-none pr-6"
              style={{ backgroundImage: 'none' }}
            >
              <option value="ALL">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        <span className="text-muted-foreground/30 hidden sm:inline">·</span>

        {tags.length > 0 && (
          <div className="flex items-center gap-1.5 max-w-[280px]">
            <Icon icon="lucide:tag" className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="h-7 px-2 rounded-md border-0 bg-transparent text-[11px] text-muted-foreground hover:text-foreground cursor-pointer focus:ring-0 focus:outline-none appearance-none pr-6"
              style={{ backgroundImage: 'none' }}
            >
              <option value="ALL">Todas las etiquetas</option>
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
              onClick={clearFilters}
              className="flex items-center gap-1 text-[11px] text-destructive hover:text-destructive/80 transition-colors"
            >
              <Icon icon="lucide:rotate-ccw" className="h-3 w-3" />
              Limpiar
            </button>
          </>
        )}
      </div>
    </div>
  )
}
