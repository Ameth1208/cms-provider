'use client'

import { Icon } from '@iconify/react'
import { useContent, type Spotlight } from '../hooks/use-content'
import { useConfirm } from '@/components/confirm-dialog'
import { formatPrice } from '@/lib/utils'

interface SpotlightItemProps {
  spotlight: Spotlight
}

export function SpotlightItem({ spotlight }: SpotlightItemProps) {
  const content = useContent()
  const { confirm, dialog } = useConfirm()

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Eliminar producto destacado',
      message: `¿Estás seguro de que querés eliminar "${spotlight.catalogItem?.name || 'este producto'}" de los destacados?`,
      confirmText: 'Eliminar',
      variant: 'destructive',
    })
    if (!confirmed) return
    await content.removeSpotlight(spotlight.id)
    content.refresh()
  }

  return (
    <>
      <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border/60 bg-background/50">
        {spotlight.catalogItem?.media?.[0]?.url ? (
          <img
            src={spotlight.catalogItem.media[0].url}
            alt=""
            className="h-10 w-10 rounded-md object-cover shrink-0 bg-muted"
          />
        ) : (
          <div className="h-10 w-10 rounded-md bg-muted shrink-0 flex items-center justify-center">
            <Icon icon="lucide:package" className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{spotlight.catalogItem?.name || 'Producto'}</p>
          <p className="text-xs text-muted-foreground">{formatPrice(spotlight.catalogItem?.price ?? 0)}</p>
        </div>
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Icon icon="lucide:trash-2" className="h-3.5 w-3.5" />
        </button>
      </div>
      {dialog}
    </>
  )
}
