'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api-client'

export interface Section {
  id: string
  type: string
  title: string | null
  order: number
  active: boolean
}

export interface Slide {
  id: string
  sectionId: string
  imageUrl: string
  title: string | null
  subtitle: string | null
  ctaText: string | null
  ctaLink: string | null
  bgColor: string | null
  buttonColor: string | null
  buttonTextColor: string | null
  textColor: string | null
  order: number
  active: boolean
}

export interface Banner {
  id: string
  sectionId: string | null
  imageUrl: string | null
  title: string | null
  description: string | null
  link: string | null
  position: string | null
  active: boolean
  order: number
}

export interface Spotlight {
  id: string
  sectionId: string
  catalogItemId: string
  order: number
  catalogItem?: {
    id: string
    name: string
    slug: string
    price: number
    media: { url: string; type: string }[]
  }
}

export type ContentItem =
  | ({ kind: 'section' } & Section)
  | ({ kind: 'slide' } & Slide)
  | ({ kind: 'banner' } & Banner)
  | ({ kind: 'spotlight' } & Spotlight)

export function useContent() {
  const { token } = useAuth()
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  // Single consolidated refresh
  const refresh = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [sectionsWithNested, bannersData] = await Promise.all([
        api.get<(Section & { slides: Slide[]; spotlights: Spotlight[] })[]>('/content/sections', token),
        api.get<Banner[]>('/content/banners', token),
      ])

      const sections: ContentItem[] = (sectionsWithNested || []).map((s) => ({ ...s, kind: 'section' as const }))
      const slides: ContentItem[] = (sectionsWithNested || []).flatMap((s) =>
        (s.slides || []).map((slide) => ({ ...slide, kind: 'slide' as const }))
      )
      const spotlights: ContentItem[] = (sectionsWithNested || []).flatMap((s) =>
        (s.spotlights || []).map((spot) => ({ ...spot, kind: 'spotlight' as const }))
      )
      const banners: ContentItem[] = (bannersData || []).map((b) => ({ ...b, kind: 'banner' as const }))

      const allItems = [...sections, ...slides, ...banners, ...spotlights].sort((a, b) => {
        const orderA = 'order' in a ? a.order : 0
        const orderB = 'order' in b ? b.order : 0
        return orderA - orderB
      })

      setItems(allItems)
      setHasLoaded(true)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token && !hasLoaded) {
      refresh().catch(() => {
        setHasLoaded(true)
      })
    }
  }, [token, hasLoaded, refresh])

  // ─── Optimistic helpers ───

  const addOptimisticItem = useCallback((item: ContentItem) => {
    setItems((prev) => [...prev, item].sort((a, b) => {
      const orderA = 'order' in a ? a.order : 0
      const orderB = 'order' in b ? b.order : 0
      return orderA - orderB
    }))
  }, [])

  const removeOptimisticItem = useCallback((id: string, kind: ContentItem['kind']) => {
    setItems((prev) => prev.filter((i) => !(i.kind === kind && i.id === id)))
  }, [])

  const updateOptimisticItem = useCallback((id: string, kind: ContentItem['kind'], data: Partial<ContentItem>) => {
    setItems((prev) => prev.map((i) => (i.kind === kind && i.id === id ? { ...i, ...data } as ContentItem : i)))
  }, [])

  // ─── Mutations with optimistic updates ───

  const createSection = useCallback(async (body: { type: string; title?: string; order?: number }) => {
    if (!token) return
    const tempId = `temp-section-${Date.now()}`
    const optimistic: ContentItem = {
      kind: 'section',
      id: tempId,
      type: body.type,
      title: body.title || null,
      order: body.order ?? 0,
      active: true,
    }
    addOptimisticItem(optimistic)

    try {
      const result = await api.post<Section>('/content/sections', body, token)
      // Replace temp with real
      setItems((prev) => prev.map((i) => (i.kind === 'section' && i.id === tempId ? { ...result, kind: 'section' as const } : i)))
      return result
    } catch (err) {
      removeOptimisticItem(tempId, 'section')
      throw err
    }
  }, [token, addOptimisticItem, removeOptimisticItem])

  const deleteSection = useCallback(async (id: string) => {
    if (!token) return
    const originalItems = [...items]
    removeOptimisticItem(id, 'section')
    // Also remove related slides and spotlights
    setItems((prev) => prev.filter((i) => {
      if (i.kind === 'slide' && i.sectionId === id) return false
      if (i.kind === 'spotlight' && i.sectionId === id) return false
      return true
    }))

    try {
      await api.delete(`/content/sections/${id}`, token)
    } catch (err) {
      setItems(originalItems)
      throw err
    }
  }, [token, items, removeOptimisticItem])

  const updateSection = useCallback(async (id: string, body: { title?: string; order?: number; active?: boolean }) => {
    if (!token) return
    const originalItems = [...items]
    updateOptimisticItem(id, 'section', body)

    try {
      const result = await api.put<Section>(`/content/sections/${id}`, body, token)
      setItems((prev) => prev.map((i) => (i.kind === 'section' && i.id === id ? { ...result, kind: 'section' as const } : i)))
      return result
    } catch (err) {
      setItems(originalItems)
      throw err
    }
  }, [token, items, updateOptimisticItem])

  const createSlide = useCallback(async (body: {
    sectionId: string
    imageUrl: string
    title?: string
    subtitle?: string
    ctaText?: string
    ctaLink?: string
    bgColor?: string
    buttonColor?: string
    buttonTextColor?: string
    textColor?: string
    order?: number
  }) => {
    if (!token) return
    const tempId = `temp-slide-${Date.now()}`
    const optimistic: ContentItem = {
      kind: 'slide',
      id: tempId,
      sectionId: body.sectionId,
      imageUrl: body.imageUrl,
      title: body.title || null,
      subtitle: body.subtitle || null,
      ctaText: body.ctaText || null,
      ctaLink: body.ctaLink || null,
      bgColor: body.bgColor || null,
      buttonColor: body.buttonColor || null,
      buttonTextColor: body.buttonTextColor || null,
      textColor: body.textColor || null,
      order: body.order ?? 0,
      active: true,
    }
    addOptimisticItem(optimistic)

    try {
      const result = await api.post<Slide>('/content/slides', body, token)
      setItems((prev) => prev.map((i) => (i.kind === 'slide' && i.id === tempId ? { ...result, kind: 'slide' as const } : i)))
      return result
    } catch (err) {
      removeOptimisticItem(tempId, 'slide')
      throw err
    }
  }, [token, addOptimisticItem, removeOptimisticItem])

  const deleteSlide = useCallback(async (id: string) => {
    if (!token) return
    const originalItems = [...items]
    removeOptimisticItem(id, 'slide')

    try {
      await api.delete(`/content/slides/${id}`, token)
    } catch (err) {
      setItems(originalItems)
      throw err
    }
  }, [token, items, removeOptimisticItem])

  const updateSlide = useCallback(async (id: string, body: Partial<Slide>) => {
    if (!token) return
    const originalItems = [...items]
    updateOptimisticItem(id, 'slide', body)

    try {
      const result = await api.put<Slide>(`/content/slides/${id}`, body, token)
      setItems((prev) => prev.map((i) => (i.kind === 'slide' && i.id === id ? { ...result, kind: 'slide' as const } : i)))
      return result
    } catch (err) {
      setItems(originalItems)
      throw err
    }
  }, [token, items, updateOptimisticItem])

  const createBanner = useCallback(async (body: {
    sectionId?: string
    imageUrl?: string
    title?: string
    description?: string
    link?: string
    position?: string
    order?: number
  }) => {
    if (!token) return
    const tempId = `temp-banner-${Date.now()}`
    const optimistic: ContentItem = {
      kind: 'banner',
      id: tempId,
      sectionId: body.sectionId || null,
      imageUrl: body.imageUrl || null,
      title: body.title || null,
      description: body.description || null,
      link: body.link || null,
      position: body.position || null,
      order: body.order ?? 0,
      active: true,
    }
    addOptimisticItem(optimistic)

    try {
      const result = await api.post<Banner>('/content/banners', body, token)
      setItems((prev) => prev.map((i) => (i.kind === 'banner' && i.id === tempId ? { ...result, kind: 'banner' as const } : i)))
      return result
    } catch (err) {
      removeOptimisticItem(tempId, 'banner')
      throw err
    }
  }, [token, addOptimisticItem, removeOptimisticItem])

  const deleteBanner = useCallback(async (id: string) => {
    if (!token) return
    const originalItems = [...items]
    removeOptimisticItem(id, 'banner')

    try {
      await api.delete(`/content/banners/${id}`, token)
    } catch (err) {
      setItems(originalItems)
      throw err
    }
  }, [token, items, removeOptimisticItem])

  const updateBanner = useCallback(async (id: string, body: Partial<Banner>) => {
    if (!token) return
    const originalItems = [...items]
    updateOptimisticItem(id, 'banner', body)

    try {
      const result = await api.put<Banner>(`/content/banners/${id}`, body, token)
      setItems((prev) => prev.map((i) => (i.kind === 'banner' && i.id === id ? { ...result, kind: 'banner' as const } : i)))
      return result
    } catch (err) {
      setItems(originalItems)
      throw err
    }
  }, [token, items, updateOptimisticItem])

  const addSpotlight = useCallback(async (body: { sectionId: string; catalogItemId: string; order?: number }) => {
    if (!token) return
    const tempId = `temp-spotlight-${Date.now()}`
    // We need catalog item info - fetch it or use optimistic placeholder
    const optimistic: ContentItem = {
      kind: 'spotlight',
      id: tempId,
      sectionId: body.sectionId,
      catalogItemId: body.catalogItemId,
      order: body.order ?? 0,
      catalogItem: undefined,
    }
    addOptimisticItem(optimistic)

    try {
      const result = await api.post<Spotlight>('/content/spotlights', body, token)
      setItems((prev) => prev.map((i) => (i.kind === 'spotlight' && i.id === tempId ? { ...result, kind: 'spotlight' as const } : i)))
      return result
    } catch (err) {
      removeOptimisticItem(tempId, 'spotlight')
      throw err
    }
  }, [token, addOptimisticItem, removeOptimisticItem])

  const removeSpotlight = useCallback(async (id: string) => {
    if (!token) return
    const originalItems = [...items]
    removeOptimisticItem(id, 'spotlight')

    try {
      await api.delete(`/content/spotlights/${id}`, token)
    } catch (err) {
      setItems(originalItems)
      throw err
    }
  }, [token, items, removeOptimisticItem])

  const reorderSpotlights = useCallback(async (body: { sectionId: string; orders: { id: string; order: number }[] }) => {
    if (!token) return
    return api.post('/content/spotlights/reorder', body, token)
  }, [token])

  // ─── Fetchers ───

  const fetchSections = useCallback(async () => {
    if (!token) return []
    return api.get<Section[]>('/content/sections', token)
  }, [token])

  const fetchSlides = useCallback(async (sectionId?: string) => {
    if (!token) return []
    const sections = await api.get<(Section & { slides: Slide[] })[]>('/content/sections', token)
    if (sectionId) {
      return sections.find((s) => s.id === sectionId)?.slides ?? []
    }
    return sections.flatMap((s) => s.slides)
  }, [token])

  const fetchBanners = useCallback(async () => {
    if (!token) return []
    return api.get<Banner[]>('/content/banners', token)
  }, [token])

  const fetchSpotlights = useCallback(async (sectionId: string) => {
    if (!token) return []
    const sections = await api.get<(Section & { spotlights: Spotlight[] })[]>('/content/sections', token)
    return sections.find((s) => s.id === sectionId)?.spotlights ?? []
  }, [token])

  return useMemo(() => ({
    items,
    setItems,
    loading,
    hasLoaded,
    refresh,
    fetchSections,
    createSection,
    updateSection,
    deleteSection,
    fetchSlides,
    createSlide,
    updateSlide,
    deleteSlide,
    fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    fetchSpotlights,
    addSpotlight,
    removeSpotlight,
    reorderSpotlights,
  }), [
    items,
    setItems,
    loading,
    hasLoaded,
    refresh,
    fetchSections,
    createSection,
    updateSection,
    deleteSection,
    fetchSlides,
    createSlide,
    updateSlide,
    deleteSlide,
    fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    fetchSpotlights,
    addSpotlight,
    removeSpotlight,
    reorderSpotlights,
  ])
}
