'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { useCatalog } from './hooks/useCatalog'
import { CatalogTable } from './components/catalog-table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function CatalogPage() {
  const { items, loading, fetchItems, deleteItem } = useCatalog()
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchItems(search ? { search } : undefined)
  }, [fetchItems, search])

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase mb-3">
            Catálogo
          </p>
          <h1 className="text-3xl sm:text-4xl font-light text-foreground tracking-tight">
            Items
          </h1>
        </div>
        <Link href="/catalog/new">
          <Button>
            <Icon icon="lucide:plus" className="mr-2 h-4 w-4" />
            Nuevo item
          </Button>
        </Link>
      </div>

      <div className="max-w-md">
        <div className="relative">
          <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nombre, descripción o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 font-light"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <CatalogTable items={items} onDelete={deleteItem} />
      )}
    </div>
  )
}
