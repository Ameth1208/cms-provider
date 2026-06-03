'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Icon } from '@iconify/react'
import { api } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import type { Category } from '@cms/shared'

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function matchesQuery(cat: Category, query: string): boolean {
  const q = query.toLowerCase()
  return (
    cat.name.toLowerCase().includes(q) ||
    cat.slug.toLowerCase().includes(q)
  )
}

function hasVisibleDescendant(cat: Category, query: string): boolean {
  if (!query) return true
  return cat.children?.some(
    (child) => matchesQuery(child, query) || hasVisibleDescendant(child, query)
  ) ?? false
}

interface CategoryRowProps {
  category: Category
  depth: number
  query: string
  onRefresh: () => void
  token: string | null
}

function CategoryRow({ category, depth, query, onRefresh, token }: CategoryRowProps) {
  const [expanded, setExpanded] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const { toast } = useToast()
  const hasChildren = (category.children?.length ?? 0) > 0

  const isSearching = query.length > 0
  const forceExpand = isSearching

  const showChildren = hasChildren && (forceExpand || expanded)

  async function handleCreateSub(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !name || !slug) return
    await api.post('/catalog/categories', { name, slug, parentId: category.id }, token)
    toast({ title: 'Subcategoría creada' })
    setCreateOpen(false)
    setName('')
    setSlug('')
    onRefresh()
  }

  async function handleDelete() {
    if (!token) return
    if (!confirm(`¿Eliminar "${category.name}"?`)) return
    await api.delete(`/catalog/categories/${category.id}`, token)
    toast({ title: 'Categoría eliminada' })
    onRefresh()
  }

  return (
    <>
      <TableRow className="hover:bg-muted/30 transition-colors duration-200">
        <TableCell className="py-3.5">
          <div className="flex items-center gap-3" style={{ paddingLeft: `${depth * 24}px` }}>
            {hasChildren ? (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center justify-center h-5 w-5 rounded-md hover:bg-muted transition-colors shrink-0"
              >
                <Icon
                  icon={showChildren ? 'lucide:chevron-down' : 'lucide:chevron-right'}
                  className="h-3.5 w-3.5 text-muted-foreground"
                />
              </button>
            ) : (
              <div className="w-5 shrink-0" />
            )}
            <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Icon icon="lucide:folder" className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{category.name}</p>
              <p className="text-xs text-muted-foreground font-mono truncate">/{category.slug}</p>
            </div>
          </div>
        </TableCell>

        <TableCell className="w-40">
          {hasChildren ? (
            <Badge variant="secondary" className="font-light text-[10px]">
              {category.children!.length} {category.children!.length === 1 ? 'subcategoría' : 'subcategorías'}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </TableCell>

        <TableCell className="text-right w-32">
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground hover:text-foreground gap-1.5"
              onClick={() => setCreateOpen(true)}
            >
              <Icon icon="lucide:plus" className="h-3.5 w-3.5" />
              Sub
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
            >
              <Icon icon="lucide:trash-2" className="h-3.5 w-3.5" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {hasChildren && showChildren &&
        category.children!.map((child) => (
          <CategoryRow
            key={child.id}
            category={child}
            depth={depth + 1}
            query={query}
            onRefresh={onRefresh}
            token={token}
          />
        ))}

      {/* Create subcategory dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-medium">Nueva subcategoría</DialogTitle>
            <DialogDescription className="font-light">
              Dentro de <span className="font-medium text-foreground">{category.name}</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSub} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (!slug || slug === generateSlug(name)) setSlug(generateSlug(e.target.value))
                }}
                placeholder="Ej: Camisetas"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ej: camisetas"
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" className="rounded-lg" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="rounded-lg">
                Crear subcategoría
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function CategoriesPage() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  const fetch = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await api.get<Category[]>('/catalog/categories/all', token)
      setCategories(data)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetch() }, [fetch])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !name || !slug) return
    await api.post('/catalog/categories', { name, slug }, token)
    toast({ title: 'Categoría creada' })
    setCreateOpen(false)
    setName('')
    setSlug('')
    fetch()
  }

  const rootCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories]
  )

  const visibleRoots = useMemo(() => {
    if (!query) return rootCategories
    return rootCategories.filter(
      (cat) => matchesQuery(cat, query) || hasVisibleDescendant(cat, query)
    )
  }, [rootCategories, query])

  const totalCount = categories.length

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-10 w-full max-w-md rounded-lg" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categorías</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCount} {totalCount === 1 ? 'categoría' : 'categorías'} en total
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Icon icon="lucide:plus" className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva categoría</span>
        </Button>
      </div>

      {/* Search */}
      <div className="rounded-xl bg-card p-4">
        <div className="relative flex-1 max-w-md">
          <Icon
            icon="lucide:search"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Buscar categorías..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
      </div>

      {/* Create root dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-medium">Nueva categoría</DialogTitle>
            <DialogDescription className="font-light">
              Crea una categoría raíz para tu catálogo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (!slug || slug === generateSlug(name)) setSlug(generateSlug(e.target.value))
                }}
                placeholder="Ej: Ropa"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ej: ropa"
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" className="rounded-lg" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="rounded-lg">
                Crear categoría
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Table */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Icon icon="lucide:folder-open" className="mx-auto h-10 w-10 mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground font-light">Sin categorías</p>
            <p className="text-sm text-muted-foreground mt-1">Crea tu primera categoría para empezar</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead className="text-xs tracking-wider uppercase">Nombre</TableHead>
                  <TableHead className="text-xs tracking-wider uppercase w-40">Subcategorías</TableHead>
                  <TableHead className="text-right text-xs tracking-wider uppercase w-32">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRoots.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-12">
                      No se encontraron categorías
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleRoots.map((cat) => (
                    <CategoryRow
                      key={cat.id}
                      category={cat}
                      depth={0}
                      query={query}
                      onRefresh={fetch}
                      token={token}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
