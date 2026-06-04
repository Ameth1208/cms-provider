'use client'

import { Icon } from '@iconify/react'
import { useContent, type Slide } from '../hooks/use-content'
import { useConfirm } from '@/components/confirm-dialog'

interface SlideItemProps {
  slide: Slide
}

export function SlideItem({ slide }: SlideItemProps) {
  const content = useContent()
  const { confirm, dialog } = useConfirm()

  const handleToggle = async () => {
    await content.updateSlide(slide.id, { active: !slide.active })
    content.refresh()
  }

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Eliminar imagen',
      message: `¿Estás seguro de que querés eliminar esta imagen del carrusel?`,
      confirmText: 'Eliminar',
      variant: 'destructive',
    })
    if (!confirmed) return
    await content.deleteSlide(slide.id)
    content.refresh()
  }

  return (
    <>
      <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border/60 bg-background/50 hover:border-primary/20 transition-colors">
        {slide.imageUrl ? (
          <img src={slide.imageUrl} alt="" className="h-12 w-16 rounded-md object-cover shrink-0 bg-muted" />
        ) : (
          <div className="h-12 w-16 rounded-md bg-muted shrink-0 flex items-center justify-center">
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
            onClick={handleDelete}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Icon icon="lucide:trash-2" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {dialog}
    </>
  )
}
