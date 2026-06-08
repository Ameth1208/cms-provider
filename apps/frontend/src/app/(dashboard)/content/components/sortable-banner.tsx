'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Icon } from '@iconify/react'
import { useContent, type Banner } from '../hooks/use-content'
import { useConfirm } from '@/components/confirm-dialog'

interface SortableBannerProps {
  banner: Banner
  onEdit: (item: { kind: 'banner'; data: Banner }) => void
}

export function SortableBanner({ banner, onEdit }: SortableBannerProps) {
  const content = useContent()
  const { confirm, dialog } = useConfirm()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `banner-${banner.id}`, data: { type: 'banner', banner } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Eliminar banner',
      message: `¿Eliminar el banner "${banner.title || 'sin título'}"?`,
      confirmText: 'Eliminar',
      variant: 'destructive',
    })
    if (!confirmed) return
    await content.deleteBanner(banner.id)
  }

  const handleToggle = async () => {
    await content.updateBanner(banner.id, { active: !banner.active })
  }

  const positionLabel =
    banner.position === 'top' ? 'Arriba' :
    banner.position === 'bottom' ? 'Abajo' : 'En medio'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted cursor-grab active:cursor-grabbing shrink-0"
      >
        <Icon icon="lucide:grip-vertical" className="h-4 w-4 text-muted-foreground" />
      </button>

      {banner.imageUrl ? (
        <img src={banner.imageUrl} alt="" className="h-12 w-20 rounded-lg object-cover shrink-0 bg-muted" />
      ) : (
        <div className="h-12 w-20 rounded-lg bg-muted shrink-0 flex items-center justify-center">
          <Icon icon="lucide:panel-top" className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{banner.title || 'Banner sin título'}</p>
        <p className="text-xs text-muted-foreground">{positionLabel}</p>
      </div>

      <div className="flex items-center gap-0.5">
        <button
          onClick={handleToggle}
          className={`p-2 rounded-lg transition-colors ${
            banner.active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-muted-foreground hover:bg-muted'
          }`}
          title={banner.active ? 'Activo' : 'Inactivo'}
        >
          <Icon icon={banner.active ? 'lucide:eye' : 'lucide:eye-off'} className="h-4 w-4" />
        </button>
        <button
          onClick={() => onEdit({ kind: 'banner', data: banner })}
          className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          title="Editar"
        >
          <Icon icon="lucide:pencil" className="h-4 w-4" />
        </button>
        <button
          onClick={handleDelete}
          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Eliminar"
        >
          <Icon icon="lucide:trash-2" className="h-4 w-4" />
        </button>
      </div>
      {dialog}
    </div>
  )
}
