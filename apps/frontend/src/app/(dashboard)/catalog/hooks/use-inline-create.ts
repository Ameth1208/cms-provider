'use client'

import { useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useCatalogFormStore } from '../store/catalog-form-store'
import { useToast } from '@/hooks/use-toast'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function useInlineCreate() {
  const { token } = useAuth()
  const { toast } = useToast()
  const createTag = useCallback(async (name: string) => {
    if (!name.trim()) return null
    useCatalogFormStore.getState().setCreatingTag(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          slug: slugify(name.trim()),
        }),
      })
      if (!res.ok) throw new Error('Error creando tag')
      const tag = await res.json()
      const state = useCatalogFormStore.getState()
      state.setTags([...state.tags, tag])
      state.toggleTag(tag.id)
      toast({ title: 'Tag creado', variant: 'default' })
      return tag
    } catch {
      toast({ title: 'Error al crear tag', variant: 'destructive' })
      return null
    } finally {
      useCatalogFormStore.getState().setCreatingTag(false)
    }
  }, [token, toast])

  const createCategory = useCallback(async (name: string) => {
    if (!name.trim()) return null
    useCatalogFormStore.getState().setCreatingCat(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          slug: slugify(name.trim()),
        }),
      })
      if (!res.ok) throw new Error('Error creando categoría')
      const cat = await res.json()
      const state = useCatalogFormStore.getState()
      state.setCategories([...state.categories, cat])
      state.setForm({ categoryId: cat.id })
      toast({ title: 'Categoría creada', variant: 'default' })
      return cat
    } catch {
      toast({ title: 'Error al crear categoría', variant: 'destructive' })
      return null
    } finally {
      useCatalogFormStore.getState().setCreatingCat(false)
    }
  }, [token, toast])

  return { createTag, createCategory }
}
