'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Icon } from '@iconify/react'
import { useState, useEffect } from 'react'
import { useContent, type Section, type Slide, type Spotlight } from '../hooks/use-content'
import { SortableSlide } from './sortable-slide'
import { SortableSpotlight } from './sortable-spotlight'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useConfirm } from '@/components/confirm-dialog'
import { useTranslation } from '@/i18n/use-translation'

const getLabels = (t: (key: string) => string): Record<string, string> => ({
  hero: t('content_section_hero'),
  featured: t('content_section_featured'),
  new_arrivals: t('content_section_new_arrivals'),
  promo: t('content_section_promo'),
  collections: t('content_section_collections'),
})

const ICONS: Record<string, string> = {
  hero: 'lucide:images',
  featured: 'lucide:sparkles',
  new_arrivals: 'lucide:package-plus',
  promo: 'lucide:tag',
  collections: 'lucide:layout-grid',
}

interface SortableSectionProps {
  section: Section
  slides: Slide[]
  spotlights: Spotlight[]
  onEdit: (item: { kind: 'section'; data: Section }) => void
  onEditSlide: (slide: Slide) => void
  onAddSlide: (sectionId: string) => void
  onAddSpotlight: (sectionId: string) => void
}

export function SortableSection({
  section,
  slides,
  spotlights,
  onEdit,
  onEditSlide,
  onAddSlide,
  onAddSpotlight,
}: SortableSectionProps) {
  const { t } = useTranslation()
  const content = useContent()
  const { confirm, dialog } = useConfirm()
  const [expanded, setExpanded] = useState(true)
  const [localActive, setLocalActive] = useState(section.active)
  const LABELS = getLabels(t)

  // Sync local state when prop changes
  useEffect(() => {
    setLocalActive(section.active)
  }, [section.active])

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `section-${section.id}`, data: { type: 'section', section } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const label = LABELS[section.type] || section.type
  const icon = ICONS[section.type] || 'lucide:layout-grid'
  const hasSlides = section.type === 'hero'
  const hasSpotlights = section.type === 'featured' || section.type === 'new_arrivals'

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: t('content_delete_section'),
      message: t('content_delete_section_confirm'),
      confirmText: t('delete'),
      variant: 'destructive',
    })
    if (!confirmed) return
    await content.deleteSection(section.id)
  }

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const newActive = !localActive
    setLocalActive(newActive) // Immediate UI feedback
    
    try {
      await content.updateSection(section.id, { active: newActive })
    } catch (error) {
      setLocalActive(!newActive) // Revert on error
      console.error('Toggle failed:', error)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      <div className="flex items-center gap-2 p-3">
        <button
          {...attributes}
          {...listeners}
          className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted cursor-grab active:cursor-grabbing shrink-0"
        >
          <Icon icon="lucide:grip-vertical" className="h-4 w-4 text-muted-foreground" />
        </button>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted transition-colors shrink-0"
        >
          <Icon
            icon={expanded ? 'lucide:chevron-down' : 'lucide:chevron-right'}
            className="h-4 w-4 text-muted-foreground"
          />
        </button>

        <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 shrink-0">
          <Icon icon={icon} className="h-4 w-4 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{section.title || label}</p>
          <p className="text-xs text-muted-foreground">
            {label} · {slides.length} {slides.length === 1 ? t('content_slide_count') : t('content_slide_count_plural')}
          </p>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={handleToggle}
            className={`p-2 rounded-lg transition-colors ${
              localActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-muted-foreground hover:bg-muted'
            }`}
            title={localActive ? t('active') : t('inactive')}
          >
            <Icon icon={localActive ? 'lucide:eye' : 'lucide:eye-off'} className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit({ kind: 'section', data: section })}
            className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title={t('edit')}
          >
            <Icon icon="lucide:pencil" className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title={t('delete')}
          >
            <Icon icon="lucide:trash-2" className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3">
          <div className="pl-10 space-y-2">
            {/* Slides */}
            {hasSlides && (
              <>
                {slides.length === 0 ? (
                  <button
                    onClick={() => onAddSlide(section.id)}
                    className="w-full py-6 border-2 border-dashed border-border rounded-lg hover:border-primary/40 hover:bg-muted/30 transition-all flex flex-col items-center gap-2"
                  >
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <Icon icon="lucide:plus" className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">{t('content_add_first_slide')}</p>
                    <p className="text-xs text-muted-foreground">{t('content_slide_drag_hint')}</p>
                  </button>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">{t('content_slide_drag_hint')}</p>
                      <button
                        onClick={() => onAddSlide(section.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Icon icon="lucide:plus" className="h-3 w-3" />
                        {t('add')}
                      </button>
                    </div>
                    <SortableContext items={slides.map((s) => `slide-${s.id}`)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-1">
                        {slides.map((slide) => (
                          <SortableSlide key={slide.id} slide={slide} onEdit={onEditSlide} />
                        ))}
                      </div>
                    </SortableContext>
                  </>
                )}
              </>
            )}

            {/* Spotlights */}
            {hasSpotlights && (
              <>
                {spotlights.length === 0 ? (
                  <button
                    onClick={() => onAddSpotlight(section.id)}
                    className="w-full py-6 border-2 border-dashed border-border rounded-lg hover:border-primary/40 hover:bg-muted/30 transition-all flex flex-col items-center gap-2"
                  >
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <Icon icon="lucide:plus" className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">{t('content_add_spotlight')}</p>
                    <p className="text-xs text-muted-foreground">{t('content_spotlight_drag_hint')}</p>
                  </button>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">{t('content_spotlight_drag_hint')}</p>
                      <button
                        onClick={() => onAddSpotlight(section.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Icon icon="lucide:plus" className="h-3 w-3" />
                        {t('add')}
                      </button>
                    </div>
                    <SortableContext items={spotlights.map((s) => `spotlight-${s.id}`)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-1">
                        {spotlights.map((spot) => (
                          <SortableSpotlight key={spot.id} spotlight={spot} />
                        ))}
                      </div>
                    </SortableContext>
                  </>
                )}
              </>
            )}

            {!hasSlides && !hasSpotlights && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                {t('content_auto_rendered')}
              </p>
            )}
          </div>
        </div>
      )}
      {dialog}
    </div>
  )
}
