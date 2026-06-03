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

  // Single consolidated refresh: 1 call to /sections + 1 call to /banners
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

  // Auto-load when token becomes available (only once)
  useEffect(() => {
    if (token && !hasLoaded) {
      refresh().catch(() => {
        // Silently fail on auto-load; user can manually retry
        setHasLoaded(true)
      })
    }
  }, [token, hasLoaded, refresh])

  // --- Individual fetchers for other uses (dialogs, forms, etc.) ---

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

  // --- Mutations ---

  const createSection = useCallback(async (body: { type: string; title?: string; order?: number }) => {
    if (!token) return
    return api.post<Section>('/content/sections', body, token)
  }, [token])

  const updateSection = useCallback(async (id: string, body: { title?: string; order?: number; active?: boolean }) => {
    if (!token) return
    return api.put<Section>(`/content/sections/${id}`, body, token)
  }, [token])

  const deleteSection = useCallback(async (id: string) => {
    if (!token) return
    return api.delete(`/content/sections/${id}`, token)
  }, [token])

  const createSlide = useCallback(async (body: {
    sectionId: string
    imageUrl: string
    title?: string
    subtitle?: string
    ctaText?: string
    ctaLink?: string
    order?: number
  }) => {
    if (!token) return
    return api.post<Slide>('/content/slides', body, token)
  }, [token])

  const updateSlide = useCallback(async (id: string, body: Partial<Slide>) => {
    if (!token) return
    return api.put<Slide>(`/content/slides/${id}`, body, token)
  }, [token])

  const deleteSlide = useCallback(async (id: string) => {
    if (!token) return
    return api.delete(`/content/slides/${id}`, token)
  }, [token])

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
    return api.post<Banner>('/content/banners', body, token)
  }, [token])

  const updateBanner = useCallback(async (id: string, body: Partial<Banner>) => {
    if (!token) return
    return api.put<Banner>(`/content/banners/${id}`, body, token)
  }, [token])

  const deleteBanner = useCallback(async (id: string) => {
    if (!token) return
    return api.delete(`/content/banners/${id}`, token)
  }, [token])

  const addSpotlight = useCallback(async (body: { sectionId: string; catalogItemId: string; order?: number }) => {
    if (!token) return
    return api.post<Spotlight>('/content/spotlights', body, token)
  }, [token])

  const removeSpotlight = useCallback(async (id: string) => {
    if (!token) return
    return api.delete(`/content/spotlights/${id}`, token)
  }, [token])

  const reorderSpotlights = useCallback(async (body: { sectionId: string; orders: { id: string; order: number }[] }) => {
    if (!token) return
    return api.post('/content/spotlights/reorder', body, token)
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
