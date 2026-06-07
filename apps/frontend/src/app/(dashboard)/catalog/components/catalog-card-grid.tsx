'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n/use-translation'
import { useConfirm } from '@/components/confirm-dialog'
import { formatPrice } from '@/lib/utils'
import { useCatalog } from '../hooks/use-catalog'
import { useCatalogFilters } from '../hooks/use-catalog-filters'
import type { CatalogItem } from '@cms/shared'

export function CatalogCardGrid() {
  const { t } = useTranslation()
  const { deleteItem } = useCatalog()
  const { filteredItems } = useCatalogFilters()
  const { confirm, dialog } = useConfirm()

  const handleDelete = async (item: CatalogItem) => {
    const confirmed = await confirm({
      title: t('confirm_delete_item'),
      message: `${t('delete')} "${item.name}"? ${t('action_cannot_be_undone') || ''}`,
      confirmText: t('delete'),
      cancelText: t('cancel'),
      variant: 'destructive',
    })
    if (!confirmed) return
    await deleteItem(item.id)
  }

  if (filteredItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Icon icon="lucide:package-open" className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-lg font-medium text-foreground mb-1">{t('empty')}</p>
        <p className="text-sm text-muted-foreground">{t('empty_desc') || t('empty')}</p>
        <Link href="/catalog/create">
          <Button variant="outline" className="mt-4 gap-2">
            <Icon icon="lucide:plus" className="h-4 w-4" />
            {t('new_item')}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {filteredItems.map((item) => (
          <CatalogCard key={item.id} item={item} onDelete={handleDelete} />
        ))}
      </div>
      {dialog}
    </>
  )
}

function CatalogCard({ item, onDelete }: { item: CatalogItem; onDelete: (item: CatalogItem) => void }) {
  const { t } = useTranslation()
  const router = useRouter()
  const firstImage = item.media?.find((m: any) => m.type === 'IMAGE')
  const firstVideo = item.media?.find((m: any) => m.type === 'VIDEO')
  const thumbnail = firstImage || firstVideo

  const finalPrice =
    item.discountType && item.discountValue > 0
      ? item.discountType === 'PERCENTAGE'
        ? Math.round(item.price * (1 - item.discountValue / 100) * 100) / 100
        : Math.max(0, item.price - item.discountValue)
      : item.price

  const hasDiscount = item.discountType && item.discountValue > 0 && finalPrice < item.price

  return (
    <div className="group relative flex flex-col rounded-xl bg-card overflow-hidden transition-all duration-200 hover:shadow-lg hover:ring-1 hover:ring-primary/20">
      <Link href={`/catalog/${item.id}`} className="relative aspect-[4/3] overflow-hidden bg-muted">
        {thumbnail ? (
          thumbnail.type === 'VIDEO' ? (
            <video src={thumbnail.url} className="w-full h-full object-cover" muted />
          ) : (
            <img src={thumbnail.url} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon icon="lucide:image" className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" className="gap-1.5" onClick={(e) => { e.preventDefault(); router.push(`/catalog/${item.id}`) }}>
              <Icon icon="lucide:pencil" className="h-3.5 w-3.5" />
              {t('edit')}
            </Button>
            <Button size="sm" variant="destructive" className="gap-1.5" onClick={(e) => { e.preventDefault(); onDelete(item) }}>
              <Icon icon="lucide:trash-2" className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="absolute top-2 left-2">
          <Badge variant={item.active ? 'default' : 'secondary'} className="text-[10px] font-medium">
            {item.active ? t('active') : t('inactive')}
          </Badge>
        </div>

        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-[10px] font-medium bg-background/80 backdrop-blur border-0">
            {item.type === 'PRODUCT' ? t('type_product') : t('type_service')}
          </Badge>
        </div>

        {hasDiscount && (
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-primary text-primary-foreground text-[10px] hover:opacity-90">
              {item.discountType === 'PERCENTAGE' ? `-${item.discountValue}%` : `-${formatPrice(item.discountValue)}`}
            </Badge>
          </div>
        )}
      </Link>

      <div className="p-3 space-y-2">
        <Link href={`/catalog/${item.id}`} className="block">
          <h3 className="text-sm font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {item.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold">{formatPrice(finalPrice)}</span>
          {hasDiscount && <span className="text-xs text-muted-foreground line-through">{formatPrice(item.price)}</span>}
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 2).map((tag: any) => (
              <Badge key={tag.tag?.id || tag.id} variant="secondary" className="text-[9px] px-1.5 py-0 font-light border-0">
                {tag.tag?.name || tag.name}
              </Badge>
            ))}
            {item.tags.length > 2 && (
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-light border-0">+{item.tags.length - 2}</Badge>
            )}
          </div>
        )}

        {item.sku && <p className="text-[10px] text-muted-foreground font-mono">{item.sku}</p>}
      </div>
    </div>
  )
}
