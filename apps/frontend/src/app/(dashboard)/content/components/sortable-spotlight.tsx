'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Icon } from '@iconify/react'
import { useContent, type Spotlight } from '../hooks/use-content'
import { useConfirm } from '@/components/confirm-dialog'

interface SortableSpotlightProps {
  spotlight: Spotlight
}

export function SortableSpotlight({ spotlight }: SortableSpotlightProps) {
  const content = useContent()
  const { confirm, dialog } = useConfirm()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `spotlight-${spotlight.id}`, data: { type: 'spotlight', spotlight } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleRemove = async () => {
    const confirmed = await confirm({
      title: 'Quitar producto',
      message: `¿Quitar "${spotlight.catalogItem?.name || 'Producto'}" de destacados?`,
      confirmText: 'Quitar',
      variant: 'destructive',
    })
    if (!confirmed) return
    await content.removeSpotlight(spotlight.id)
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

      {spotlight.catalogItem?.media?.[0]?.url ? (
        <img src={spotlight.catalogItem.media[0].url} alt="" className="h-10 w-10 rounded-md object-cover shrink-0" />
      ) : (
        <div className="h-10 w-10 rounded-md bg-muted shrink-0 flex items-center justify-center">
          <Icon icon="lucide:package" className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{spotlight.catalogItem?.name || 'Producto'}</p>
      </div>

      <button
        onClick={handleRemove}
        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
      >
        <Icon icon="lucide:x" className="h-3.5 w-3.5" />
      </button>
      {dialog}
    </div>
  )
}
