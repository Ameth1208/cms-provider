'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import type { Category } from '@cms/shared'

export function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function matchesQuery(cat: Category, query: string): boolean {
  const q = query.toLowerCase()
  return (
    cat.name.toLowerCase().includes(q) ||
    cat.slug.toLowerCase().includes(q)
  )
}

export function hasVisibleDescendant(cat: Category, query: string): boolean {
  if (!query) return true
  return cat.children?.some(
    (child) => matchesQuery(child, query) || hasVisibleDescendant(child, query)
  ) ?? false
}

export function useCategories() {
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

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!token || !name || !slug) return
      await api.post('/catalog/categories', { name, slug }, token)
      toast({ title: 'Categoría creada' })
      setCreateOpen(false)
      setName('')
      setSlug('')
      fetch()
    },
    [token, name, slug, fetch, toast]
  )

  const handleCreateSub = useCallback(
    async (parentId: string, subName: string, subSlug: string) => {
      if (!token || !subName || !subSlug) return
      await api.post('/catalog/categories', { name: subName, slug: subSlug, parentId }, token)
      toast({ title: 'Subcategoría creada' })
      fetch()
    },
    [token, fetch, toast]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      if (!token) return
      await api.delete(`/catalog/categories/${id}`, token)
      toast({ title: 'Categoría eliminada' })
      fetch()
    },
    [token, fetch, toast]
  )

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

  return {
    categories,
    loading,
    query,
    setQuery,
    createOpen,
    setCreateOpen,
    name,
    setName,
    slug,
    setSlug,
    handleCreate,
    handleCreateSub,
    handleDelete,
    visibleRoots,
    totalCount,
    token,
    fetch,
  }
}
