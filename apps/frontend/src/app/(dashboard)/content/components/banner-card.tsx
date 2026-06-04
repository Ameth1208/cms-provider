'use client'

import { Icon } from '@iconify/react'
import { useContent, type Banner } from '../hooks/use-content'
import { useConfirm } from '@/components/confirm-dialog'

interface BannerCardProps {
  banner: Banner
}

export function BannerCard({ banner }: BannerCardProps) {
  const content = useContent()
  const { confirm, dialog } = useConfirm()

  const handleToggle = async () => {
    await content.updateBanner(banner.id, { active: !banner.active })
    content.refresh()
  }

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Eliminar banner',
      message: `¿Estás seguro de que querés eliminar el banner "${banner.title || 'sin título'}"?`,
      confirmText: 'Eliminar',
      variant: 'destructive',
    })
    if (!confirmed) return
    await content.deleteBanner(banner.id)
    content.refresh()
  }

  const positionLabel =
    banner.position === 'top' ? 'Arriba de todo' :
    banner.position === 'bottom' ? 'Abajo de todo' :
    'En medio del contenido'

  return (
    <>
      <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
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
            onClick={handleDelete}
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Eliminar"
          >
            <Icon icon="lucide:trash-2" className="h-4 w-4" />
          </button>
        </div>
      </div>
      {dialog}
    </>
  )
}
