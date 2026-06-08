'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Icon } from '@iconify/react'
import { useContent, type Slide } from '../hooks/use-content'
import { useConfirm } from '@/components/confirm-dialog'

interface SortableSlideProps {
  slide: Slide
  onEdit: (slide: Slide) => void
}

export function SortableSlide({ slide, onEdit }: SortableSlideProps) {
  const content = useContent()
  const { confirm, dialog } = useConfirm()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `slide-${slide.id}`, data: { type: 'slide', slide } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Eliminar imagen',
      message: '¿Eliminar esta imagen del carrusel?',
      confirmText: 'Eliminar',
      variant: 'destructive',
    })
    if (!confirmed) return
    await content.deleteSlide(slide.id)
  }

  const handleToggle = async () => {
    await content.updateSlide(slide.id, { active: !slide.active })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-background/50 hover:border-primary/20 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="flex items-center justify-center h-6 w-6 rounded hover:bg-muted cursor-grab active:cursor-grabbing shrink-0"
      >
        <Icon icon="lucide:grip-vertical" className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {slide.imageUrl ? (
        <img src={slide.imageUrl} alt="" className="h-10 w-14 rounded-md object-cover shrink-0 bg-muted" />
      ) : (
        <div className="h-10 w-14 rounded-md bg-muted shrink-0 flex items-center justify-center">
          <Icon icon="lucide:image" className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{slide.title || 'Sin título'}</p>
        <p className="text-xs text-muted-foreground truncate">{slide.subtitle || 'Sin subtítulo'}</p>
      </div>

      <div className="flex items-center gap-0.5">
        <button
          onClick={handleToggle}
          className={`p-1.5 rounded-md transition-colors ${
            slide.active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Icon icon={slide.active ? 'lucide:eye' : 'lucide:eye-off'} className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onEdit(slide)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
        >
          <Icon icon="lucide:pencil" className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Icon icon="lucide:trash-2" className="h-3.5 w-3.5" />
        </button>
      </div>
      {dialog}
    </div>
  )
}
