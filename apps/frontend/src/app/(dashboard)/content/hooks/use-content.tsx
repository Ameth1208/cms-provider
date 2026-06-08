'use client'

import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react'
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
  textColor: string | null
  buttonColor: string | null
  buttonTextColor: string | null
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

interface ContentContextType {
  items: ContentItem[]
  setItems: React.Dispatch<React.SetStateAction<ContentItem[]>>
  loading: boolean
  hasLoaded: boolean
  refresh: () => Promise<void>
  createSection: (body: { type: string; title?: string; order?: number }) => Promise<Section | undefined>
  updateSection: (id: string, body: { title?: string; order?: number; active?: boolean }) => Promise<Section | undefined>
  deleteSection: (id: string) => Promise<void>
  createSlide: (body: {
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
  }) => Promise<Slide | undefined>
  updateSlide: (id: string, body: Partial<Slide>) => Promise<Slide | undefined>
  deleteSlide: (id: string) => Promise<void>
  createBanner: (body: {
    sectionId?: string
    imageUrl?: string
    title?: string
    description?: string
    link?: string
    position?: string
    order?: number
  }) => Promise<Banner | undefined>
  updateBanner: (id: string, body: Partial<Banner>) => Promise<Banner | undefined>
  deleteBanner: (id: string) => Promise<void>
  addSpotlight: (body: { sectionId: string; catalogItemId: string; order?: number }) => Promise<Spotlight | undefined>
  removeSpotlight: (id: string) => Promise<void>
  reorderSpotlights: (body: { sectionId: string; orders: { id: string; order: number }[] }) => Promise<void>
  reorderSections: (orders: { id: string; order: number }[]) => Promise<void>
  reorderSlides: (body: { sectionId: string; orders: { id: string; order: number }[] }) => Promise<void>
  reorderBanners: (orders: { id: string; order: number }[]) => Promise<void>
}

const ContentContext = createContext<ContentContextType | null>(null)

export function ContentProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  // Fetch all content
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

  // Optimistic helpers
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

  // Section operations
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
      setItems((prev) => prev.map((i) => (i.kind === 'section' && i.id === tempId ? { ...result, kind: 'section' as const } : i)))
      return result
    } catch (err) {
      removeOptimisticItem(tempId, 'section')
      throw err
    }
  }, [token, addOptimisticItem, removeOptimisticItem])

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

  const deleteSection = useCallback(async (id: string) => {
    if (!token) return
    const originalItems = [...items]
    removeOptimisticItem(id, 'section')
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

  // Slide operations
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

  // Banner operations
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

  // Spotlight operations
  const addSpotlight = useCallback(async (body: { sectionId: string; catalogItemId: string; order?: number }) => {
    if (!token) return
    const tempId = `temp-spotlight-${Date.now()}`
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

  // Reorder operations
  const reorderSections = useCallback(async (orders: { id: string; order: number }[]) => {
    if (!token) return
    await api.post('/content/sections/reorder', { orders }, token)
  }, [token])

  const reorderSlides = useCallback(async (body: { sectionId: string; orders: { id: string; order: number }[] }) => {
    if (!token) return
    await api.post('/content/slides/reorder', body, token)
  }, [token])

  const reorderBanners = useCallback(async (orders: { id: string; order: number }[]) => {
    if (!token) return
    await api.post('/content/banners/reorder', { orders }, token)
  }, [token])

  const reorderSpotlights = useCallback(async (body: { sectionId: string; orders: { id: string; order: number }[] }) => {
    if (!token) return
    await api.post('/content/spotlights/reorder', body, token)
  }, [token])

  const value = useMemo(() => ({
    items,
    setItems,
    loading,
    hasLoaded,
    refresh,
    createSection,
    updateSection,
    deleteSection,
    createSlide,
    updateSlide,
    deleteSlide,
    createBanner,
    updateBanner,
    deleteBanner,
    addSpotlight,
    removeSpotlight,
    reorderSpotlights,
    reorderSections,
    reorderSlides,
    reorderBanners,
  }), [
    items, setItems, loading, hasLoaded, refresh,
    createSection, updateSection, deleteSection,
    createSlide, updateSlide, deleteSlide,
    createBanner, updateBanner, deleteBanner,
    addSpotlight, removeSpotlight, reorderSpotlights,
    reorderSections, reorderSlides, reorderBanners,
  ])

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent() {
  const context = useContext(ContentContext)
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider')
  }
  return context
}
