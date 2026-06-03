'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'
import { useCatalogFormStore } from '../store/catalog-form-store'
import { useMediaUpload } from './use-media-upload'
import type { CatalogItem } from '@cms/shared'

export function useCatalogForm(itemId: string) {
  const isNew = itemId === 'create'
  const { token } = useAuth()
  const { uploadBatch } = useMediaUpload()

  const [pageLoaded, setPageLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  // Solo leemos las funciones del store que necesitamos (estables)
  const setCategories = useCatalogFormStore((s) => s.setCategories)
  const setTags = useCatalogFormStore((s) => s.setTags)
  const setForm = useCatalogFormStore((s) => s.setForm)
  const setMedia = useCatalogFormStore((s) => s.setMedia)
  const setVariants = useCatalogFormStore((s) => s.setVariants)
  const setPendingFiles = useCatalogFormStore((s) => s.setPendingFiles)
  const setPendingPreviews = useCatalogFormStore((s) => s.setPendingPreviews)

  // Leemos el estado que necesitamos para el submit
  const formState = useCatalogFormStore((s) => s.form)
  const variantsState = useCatalogFormStore((s) => s.variants)
  const pendingFilesState = useCatalogFormStore((s) => s.pendingFiles)

  useEffect(() => {
    if (!token) return
    setPageLoaded(false)

    async function load() {
      try {
        const [cats, tgs] = await Promise.all([
          api.get('/catalog/categories/all', token),
          api.get('/catalog/tags/all', token),
        ])
        setCategories(cats)
        setTags(tgs)

        if (!isNew) {
          const data = await api.get<CatalogItem>(`/catalog/${itemId}`, token)
          setForm({
            name: data.name,
            slug: data.slug,
            description: data.description || '',
            price: data.price,
            comparePrice: data.comparePrice || 0,
            discountType: data.discountType || '',
            discountValue: data.discountValue || 0,
            type: data.type,
            sku: data.sku || '',
            barcode: data.barcode || '',
            active: data.active,
            visibility: data.visibility || 'visible',
            featured: data.featured || false,
            label: data.label || '',
            categoryId: data.categoryId || '',
            tagIds: data.tags.map((t: any) => t.tag?.id ?? t.id),
            brand: data.brand || '',
            material: data.material || '',
            gender: data.gender || '',
            season: data.season || '',
            fit: data.fit || '',
            weight: data.weight || 0,
            dimensions: data.dimensions || '',
            country: data.country || '',
            careInstructions: data.careInstructions || '',
            metaTitle: data.metaTitle || '',
            metaDescription: data.metaDescription || '',
          })
          setMedia(data.media || [])
          setVariants(
            (data.variants || []).map((v) => ({
              id: v.id,
              name: v.name,
              sku: v.sku,
              color: v.color,
              colorHex: v.colorHex,
              size: v.size,
              price: v.price,
              stock: v.stock,
              active: v.active,
            }))
          )
        }
      } finally {
        setPageLoaded(true)
      }
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, token, isNew])

  const submit = useCallback(async () => {
    if (!token) return
    setSaving(true)
    try {
      const body = {
        ...formState,
        categoryId: formState.categoryId || undefined,
        tagIds: formState.tagIds.length ? formState.tagIds : undefined,
        variants: variantsState.length > 0 ? variantsState : undefined,
      }
      let catalogId: string
      if (isNew) {
        const created = await api.post<CatalogItem>('/catalog', body, token)
        catalogId = created.id
      } else {
        await api.put(`/catalog/${itemId}`, body, token)
        catalogId = itemId
      }

      if (pendingFilesState.length > 0) {
        await uploadBatch(catalogId, pendingFilesState)
      }

      setPendingFiles([])
      setPendingPreviews([])

      return catalogId
    } catch {
      throw new Error('Error guardando el producto')
    } finally {
      setSaving(false)
    }
  }, [token, formState, variantsState, pendingFilesState, isNew, itemId, uploadBatch, setPendingFiles, setPendingPreviews])

  return { isNew, submit, pageLoaded, saving }
}
