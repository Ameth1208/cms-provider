'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import type { CatalogItem } from '@cms/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n/use-translation'

interface Props {
  items: CatalogItem[]
  onDelete: (id: string) => void
}

export function CatalogCardGrid({ items, onDelete }: Props) {
  const { t } = useTranslation()

  if (items.length === 0) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {items.map((item) => (
        <CatalogCard key={item.id} item={item} onDelete={onDelete} />
      ))}
    </div>
  )
}

function CatalogCard({ item, onDelete }: { item: CatalogItem; onDelete: (id: string) => void }) {
  const { t } = useTranslation()
  const firstImage = item.media?.find((m) => m.type === 'IMAGE')
  const firstVideo = item.media?.find((m) => m.type === 'VIDEO')
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
      {/* Thumbnail */}
      <Link href={`/catalog/${item.id}`} className="relative aspect-[4/3] overflow-hidden bg-muted">
        {thumbnail ? (
          thumbnail.type === 'VIDEO' ? (
            <video src={thumbnail.url} className="w-full h-full object-cover" muted />
          ) : (
            <img
              src={thumbnail.url}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon icon="lucide:image" className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <Link href={`/catalog/${item.id}`}>
              <Button size="sm" variant="secondary" className="gap-1.5">
                <Icon icon="lucide:pencil" className="h-3.5 w-3.5" />
                {t('edit')}
              </Button>
            </Link>
            <Button
              size="sm"
              variant="destructive"
              className="gap-1.5"
              onClick={(e) => {
                e.preventDefault()
                onDelete(item.id)
              }}
            >
              <Icon icon="lucide:trash-2" className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <Badge
            variant={item.active ? 'default' : 'secondary'}
            className="text-[10px] font-medium"
          >
            {item.active ? t('active') : t('inactive')}
          </Badge>
        </div>

        {/* Type badge */}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-[10px] font-medium bg-background/80 backdrop-blur border-0">
            {item.type === 'PRODUCT' ? t('type_product') : t('type_service')}
          </Badge>
        </div>

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-green-600 hover:bg-green-700 text-[10px]">
              {item.discountType === 'PERCENTAGE'
                ? `-${item.discountValue}%`
                : `-$${item.discountValue}`}
            </Badge>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-3 space-y-2">
        <Link href={`/catalog/${item.id}`} className="block">
          <h3 className="text-sm font-medium line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {item.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold">${finalPrice.toFixed(2)}</span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              ${item.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 2).map((tag: any) => (
              <Badge key={tag.tag?.id || tag.id} variant="secondary" className="text-[9px] px-1.5 py-0 font-light border-0">
                {tag.tag?.name || tag.name}
              </Badge>
            ))}
            {item.tags.length > 2 && (
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-light border-0">
                +{item.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* SKU */}
        {item.sku && (
          <p className="text-[10px] text-muted-foreground font-mono">{item.sku}</p>
        )}
      </div>
    </div>
  )
}
