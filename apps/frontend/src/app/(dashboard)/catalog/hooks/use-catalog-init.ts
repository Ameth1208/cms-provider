'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'
import { useCatalogStore } from '../store/catalog-store'
import type { Category, Tag } from '@cms/shared'

export function useCatalogInit() {
  const { token } = useAuth()

  const search = useCatalogStore((s) => s.search)
  const filterType = useCatalogStore((s) => s.filterType)
  const filterCategory = useCatalogStore((s) => s.filterCategory)
  const filterTag = useCatalogStore((s) => s.filterTag)

  // Fetch categories & tags once
  useEffect(() => {
    if (!token) return
    Promise.all([
      api.get<Category[]>('/catalog/categories/all', token),
      api.get<Tag[]>('/catalog/tags/all', token),
    ]).then(([cats, tgs]) => {
      useCatalogStore.getState().setCategories(cats)
      useCatalogStore.getState().setTags(tgs)
    })
  }, [token])

  // Fetch items when filters change
  useEffect(() => {
    if (!token) return
    const params: Record<string, string> = {}
    if (search) params.search = search
    if (filterType !== 'ALL') params.type = filterType
    if (filterCategory !== 'ALL') params.categoryId = filterCategory
    if (filterTag !== 'ALL') params.tagId = filterTag

    const qs = Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : ''

    useCatalogStore.getState().setLoading(true)
    api.get<any[]>(`/catalog${qs}`, token)
      .then((data) => {
        useCatalogStore.getState().setItems(data)
        useCatalogStore.getState().setLoading(false)
      })
      .catch(() => {
        useCatalogStore.getState().setItems([])
        useCatalogStore.getState().setLoading(false)
      })
  }, [token, search, filterType, filterCategory, filterTag])
}
