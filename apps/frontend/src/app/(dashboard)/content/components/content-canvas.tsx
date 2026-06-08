'use client'

import { useState, useCallback, useMemo } from 'react'
import { Icon } from '@iconify/react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { useContent, type Section, type Slide, type Banner, type ContentItem } from '../hooks/use-content'
import { SortableSection } from './sortable-section'
import { SortableBanner } from './sortable-banner'
import { EditDrawer } from './edit-drawer'
import { CreateSlideDialog } from './create-slide-dialog'
import { CreateSpotlightDialog } from './create-spotlight-dialog'
import { CreateBannerDialog } from './create-banner-dialog'
import { ContentPreviewV2 } from './content-preview-v2'
import { ListSkeleton } from '@/components/skeletons'
import { useTranslation } from '@/i18n/use-translation'

interface ContentCanvasProps {
  onCreateSection?: () => void
}

export function ContentCanvas({ onCreateSection }: ContentCanvasProps) {
  const { t } = useTranslation()
  const content = useContent()
  const { items, loading } = content

  const [createSlideOpen, setCreateSlideOpen] = useState(false)
  const [createSpotlightOpen, setCreateSpotlightOpen] = useState(false)
  const [createBannerOpen, setCreateBannerOpen] = useState(false)
  const [activeSectionId, setActiveSectionId] = useState('')

  const [editItem, setEditItem] = useState<
    | { kind: 'section'; data: Section }
    | { kind: 'slide'; data: Slide }
    | { kind: 'banner'; data: Banner }
    | null
  >(null)
  const [editOpen, setEditOpen] = useState(false)

  const [activeDragItem, setActiveDragItem] = useState<ContentItem | null>(null)

  // Computed data - useMemo to ensure preview updates
  const sections = useMemo(() => 
    items.filter((i): i is ContentItem & { kind: 'section' } => i.kind === 'section'),
    [items]
  )
  
  const slides = useMemo(() => 
    items.filter((i): i is ContentItem & { kind: 'slide' } => i.kind === 'slide'),
    [items]
  )
  
  const banners = useMemo(() => 
    items.filter((i): i is ContentItem & { kind: 'banner' } => i.kind === 'banner'),
    [items]
  )
  
  const spotlights = useMemo(() => 
    items.filter((i): i is ContentItem & { kind: 'spotlight' } => i.kind === 'spotlight'),
    [items]
  )

  const getSlides = useCallback((id: string) => {
    return slides
      .filter((s) => s.sectionId === id)
      .sort((a, b) => a.order - b.order)
  }, [slides])

  const getSpotlights = useCallback((id: string) => {
    return spotlights
      .filter((s) => s.sectionId === id)
      .sort((a, b) => a.order - b.order)
  }, [spotlights])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const data = active.data.current
    if (data?.type === 'section') {
      setActiveDragItem({ kind: 'section', ...data.section })
    } else if (data?.type === 'slide') {
      setActiveDragItem({ kind: 'slide', ...data.slide })
    } else if (data?.type === 'banner') {
      setActiveDragItem({ kind: 'banner', ...data.banner })
    } else if (data?.type === 'spotlight') {
      setActiveDragItem({ kind: 'spotlight', ...data.spotlight })
    }
  }, [])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      setActiveDragItem(null)

      if (!over || active.id === over.id) return

      const activeData = active.data.current
      const overData = over.data.current

      if (!activeData) return

      // Reorder sections
      if (activeData.type === 'section') {
        const oldIndex = sections.findIndex((s) => `section-${s.id}` === active.id)
        const newIndex = sections.findIndex((s) => `section-${s.id}` === over.id)

        if (oldIndex !== -1 && newIndex !== -1) {
          const newSections = arrayMove(sections, oldIndex, newIndex)
          const orders = newSections.map((s, index) => ({ id: s.id, order: index }))

          // Optimistic update
          content.setItems((prev) => {
            const updated = prev.map((item) => {
              if (item.kind === 'section') {
                const order = orders.find((o) => o.id === item.id)?.order
                if (order !== undefined) return { ...item, order }
              }
              return item
            })
            return updated
          })

          await content.reorderSections(orders)
        }
      }

      // Reorder slides within a section
      if (activeData.type === 'slide') {
        const sectionId = activeData.slide.sectionId
        const sectionSlides = getSlides(sectionId)
        const oldIndex = sectionSlides.findIndex((s) => `slide-${s.id}` === active.id)
        const newIndex = sectionSlides.findIndex((s) => `slide-${s.id}` === over.id)

        if (oldIndex !== -1 && newIndex !== -1) {
          const newSlides = arrayMove(sectionSlides, oldIndex, newIndex)
          const orders = newSlides.map((s, index) => ({ id: s.id, order: index }))

          // Optimistic update
          content.setItems((prev) => {
            const updated = prev.map((item) => {
              if (item.kind === 'slide' && item.sectionId === sectionId) {
                const order = orders.find((o) => o.id === item.id)?.order
                if (order !== undefined) return { ...item, order }
              }
              return item
            })
            return updated
          })

          await content.reorderSlides({ sectionId, orders })
        }
      }

      // Reorder banners
      if (activeData.type === 'banner') {
        const oldIndex = banners.findIndex((b) => `banner-${b.id}` === active.id)
        const newIndex = banners.findIndex((b) => `banner-${b.id}` === over.id)

        if (oldIndex !== -1 && newIndex !== -1) {
          const newBanners = arrayMove(banners, oldIndex, newIndex)
          const orders = newBanners.map((b, index) => ({ id: b.id, order: index }))

          // Optimistic update
          content.setItems((prev) => {
            const updated = prev.map((item) => {
              if (item.kind === 'banner') {
                const order = orders.find((o) => o.id === item.id)?.order
                if (order !== undefined) return { ...item, order }
              }
              return item
            })
            return updated
          })

          await content.reorderBanners(orders)
        }
      }

      // Reorder spotlights within a section
      if (activeData.type === 'spotlight') {
        const sectionId = activeData.spotlight.sectionId
        const sectionSpotlights = getSpotlights(sectionId)
        const oldIndex = sectionSpotlights.findIndex((s) => `spotlight-${s.id}` === active.id)
        const newIndex = sectionSpotlights.findIndex((s) => `spotlight-${s.id}` === over.id)

        if (oldIndex !== -1 && newIndex !== -1) {
          const newSpotlights = arrayMove(sectionSpotlights, oldIndex, newIndex)
          const orders = newSpotlights.map((s, index) => ({ id: s.id, order: index }))

          // Optimistic update
          content.setItems((prev) => {
            const updated = prev.map((item) => {
              if (item.kind === 'spotlight' && item.sectionId === sectionId) {
                const order = orders.find((o) => o.id === item.id)?.order
                if (order !== undefined) return { ...item, order }
              }
              return item
            })
            return updated
          })

          await content.reorderSpotlights({ sectionId, orders })
        }
      }
    },
    [sections, banners, spotlights, content, getSlides, getSpotlights]
  )

  const handleEditSection = (item: { kind: 'section'; data: Section }) => {
    setEditItem(item)
    setEditOpen(true)
  }

  const handleEditSlide = (slide: Slide) => {
    setEditItem({ kind: 'slide', data: slide })
    setEditOpen(true)
  }

  const handleEditBanner = (item: { kind: 'banner'; data: Banner }) => {
    setEditItem(item)
    setEditOpen(true)
  }

  const handleAddSlide = (sectionId: string) => {
    setActiveSectionId(sectionId)
    setCreateSlideOpen(true)
  }

  const handleAddSpotlight = (sectionId: string) => {
    setActiveSectionId(sectionId)
    setCreateSpotlightOpen(true)
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Editor - 7 columns */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:layout-grid" className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('content_sections_drag_hint')}</p>
              </div>

              {loading ? (
                <ListSkeleton count={2} />
              ) : sections.length === 0 ? (
                <button
                  onClick={() => onCreateSection?.()}
                  className="w-full py-12 border-2 border-dashed border-border rounded-xl hover:border-primary/40 hover:bg-muted/30 transition-all flex flex-col items-center gap-3"
                >
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Icon icon="lucide:plus" className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">{t('content_create_first_section')}</p>
                  <p className="text-xs text-muted-foreground max-w-[240px] text-center">
                    {t('content_section_description')}
                  </p>
                </button>
              ) : (
                <SortableContext
                  items={sections.map((s) => `section-${s.id}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {sections
                      .sort((a, b) => a.order - b.order)
                      .map((section) => (
                        <SortableSection
                          key={section.id}
                          section={section}
                          slides={getSlides(section.id)}
                          spotlights={getSpotlights(section.id)}
                          onEdit={handleEditSection}
                          onEditSlide={handleEditSlide}
                          onAddSlide={handleAddSlide}
                          onAddSpotlight={handleAddSpotlight}
                        />
                      ))}
                  </div>
                </SortableContext>
              )}
            </div>

            <div className="border-t border-border" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:panel-top" className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('content_banners')}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setCreateBannerOpen(true)}>
                  <Icon icon="lucide:plus" className="h-3.5 w-3.5 mr-1" />
                  {t('content_new_banner')}
                </Button>
              </div>

              {banners.length === 0 ? (
                <button
                  onClick={() => setCreateBannerOpen(true)}
                  className="w-full py-8 border-2 border-dashed border-border rounded-xl hover:border-primary/40 hover:bg-muted/30 transition-all flex flex-col items-center gap-2"
                >
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Icon icon="lucide:plus" className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">{t('content_new_banner')}</p>
                  <p className="text-xs text-muted-foreground">{t('content_banner_description')}</p>
                </button>
              ) : (
                <SortableContext
                  items={banners.map((b) => `banner-${b.id}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {banners
                      .sort((a, b) => a.order - b.order)
                      .map((banner) => (
                        <SortableBanner
                          key={banner.id}
                          banner={banner}
                          onEdit={handleEditBanner}
                        />
                      ))}
                  </div>
                </SortableContext>
              )}
            </div>
          </div>

          {/* Right: Preview - 5 columns */}
          <div className="lg:col-span-5">
            <div className="sticky top-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{t('content_preview')}</p>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs text-muted-foreground">{t('content_preview_live')}</p>
                </div>
              </div>
              <ContentPreviewV2
                sections={sections}
                slides={slides}
                banners={banners}
                spotlights={spotlights}
              />
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeDragItem && (
            <div className="rounded-xl border-2 border-primary bg-card p-3 shadow-lg opacity-90">
              <div className="flex items-center gap-3">
                <Icon icon="lucide:grip-vertical" className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {activeDragItem.kind === 'section' && (activeDragItem.title || 'Sección')}
                  {activeDragItem.kind === 'slide' && (activeDragItem.title || 'Imagen')}
                  {activeDragItem.kind === 'banner' && (activeDragItem.title || 'Banner')}
                  {activeDragItem.kind === 'spotlight' && (activeDragItem.catalogItem?.name || 'Producto')}
                </p>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <EditDrawer open={editOpen} onOpenChange={setEditOpen} item={editItem} />

      <CreateSlideDialog
        sectionId={activeSectionId}
        open={createSlideOpen}
        onOpenChange={setCreateSlideOpen}
        onSuccess={() => {}}
      />
      <CreateSpotlightDialog
        sectionId={activeSectionId}
        open={createSpotlightOpen}
        onOpenChange={setCreateSpotlightOpen}
        onSuccess={() => {}}
      />
      <CreateBannerDialog
        open={createBannerOpen}
        onOpenChange={setCreateBannerOpen}
        onSuccess={() => {}}
      />
    </>
  )
}
