'use client'

import { Icon } from '@iconify/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useCatalogFormStore } from '../../store/catalog-form-store'
import { useTranslation } from '@/i18n/use-translation'
import { formatPrice } from '@/lib/utils'

const labelMap: Record<string, { labelKey: string; color: string }> = {
  new: { labelKey: 'new_label', color: 'bg-blue-500' },
  bestseller: { labelKey: 'bestseller_label', color: 'bg-amber-500' },
  sale: { labelKey: 'sale_label', color: 'bg-red-500' },
  limited: { labelKey: 'limited_label', color: 'bg-purple-500' },
}

export function ProductPreview() {
  const form = useCatalogFormStore((s) => s.form)
  const categories = useCatalogFormStore((s) => s.categories)
  const tags = useCatalogFormStore((s) => s.tags)
  const media = useCatalogFormStore((s) => s.media)
  const pendingPreviews = useCatalogFormStore((s) => s.pendingPreviews)
  const variants = useCatalogFormStore((s) => s.variants)
  const { t } = useTranslation()

  const categoryName = categories.find((c) => c.id === form.categoryId)?.name
  const selectedTagNames = tags.filter((t) => form.tagIds.includes(t.id)).map((t) => t.name)

  const finalPrice =
    form.discountType && form.discountValue > 0
      ? form.discountType === 'PERCENTAGE'
        ? Math.round(form.price * (1 - form.discountValue / 100) * 100) / 100
        : Math.max(0, Math.round((form.price - form.discountValue) * 100) / 100)
      : form.price

  const discountLabel =
    form.discountType === 'PERCENTAGE'
      ? `-${form.discountValue}%`
      : form.discountType === 'FIXED'
      ? `-${formatPrice(form.discountValue)}`
      : ''

  const allMedia = [
    ...media.map((m) => ({ url: m.url, isVideo: m.type === 'VIDEO' })),
    ...pendingPreviews.map((p) => ({
      url: p.preview,
      isVideo: p.file.type.startsWith('video/'),
    })),
  ]

  const firstMedia = allMedia[0]
  const labelInfo = form.label ? labelMap[form.label] : null
  const activeVariants = variants.filter((v) => v.active)
  const totalStock = activeVariants.reduce((sum, v) => sum + v.stock, 0)

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-base font-medium">{t('title')}</CardTitle>
        <CardDescription>{t('preview_desc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-[4/3] rounded-xl bg-muted overflow-hidden relative">
          {firstMedia ? (
            firstMedia.isVideo ? (
              <video src={firstMedia.url} className="w-full h-full object-cover" controls />
            ) : (
              <img src={firstMedia.url} alt={form.name} className="w-full h-full object-cover" />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Icon icon="lucide:image" className="h-12 w-12 opacity-30" />
            </div>
          )}
          {labelInfo && (
            <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-medium text-white ${labelInfo.color}`}>
              {t(labelInfo.labelKey)}
            </span>
          )}
          {form.featured && (
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500 text-white">
              {t('featured_product')}
            </span>
          )}
        </div>

        {allMedia.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allMedia.slice(0, 5).map((m, i) => (
              <div
                key={i}
                className={`h-14 w-14 rounded-lg overflow-hidden shrink-0 ${
                  i === 0 ? 'ring-2 ring-primary' : ''
                }`}
              >
                {m.isVideo ? (
                  <video src={m.url} className="w-full h-full object-cover" />
                ) : (
                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
            ))}
            {allMedia.length > 5 && (
              <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0">
                +{allMedia.length - 5}
              </div>
            )}
          </div>
        )}

        <Separator />

        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-[10px]">
                {form.type === 'PRODUCT' ? t('type_product') : t('type_service')}
              </Badge>
              {form.brand && (
                <span className="text-[10px] text-muted-foreground">{form.brand}</span>
              )}
            </div>
            <h3 className="text-lg font-medium leading-tight">{form.name || t('no_name')}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              {form.sku && <p className="text-xs text-muted-foreground">SKU: {form.sku}</p>}
              {form.barcode && <p className="text-xs text-muted-foreground">· {form.barcode}</p>}
            </div>
          </div>

          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="text-2xl font-medium">{formatPrice(finalPrice)}</p>
            {form.comparePrice > 0 && form.comparePrice > finalPrice && (
              <p className="text-sm text-muted-foreground line-through">{formatPrice(form.comparePrice)}</p>
            )}
            {discountLabel && (
              <Badge className="bg-primary text-primary-foreground text-[10px] hover:opacity-90">{discountLabel}</Badge>
            )}
          </div>

          {form.type === 'PRODUCT' && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {form.gender && <span>{form.gender}</span>}
              {form.season && <span>· {form.season}</span>}
              {form.fit && <span>· {form.fit}</span>}
              {form.material && <span>· {form.material}</span>}
            </div>
          )}

          {form.description && (
            <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
              {form.description}
            </p>
          )}

          {categoryName && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Icon icon="lucide:folder" className="h-3.5 w-3.5" />
              {categoryName}
            </div>
          )}

          {selectedTagNames.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedTagNames.map((name) => (
                <Badge key={name} variant="secondary" className="text-[10px] font-light border-0">
                  {name}
                </Badge>
              ))}
            </div>
          )}

          {activeVariants.length > 0 && (
            <div className="p-2 rounded-lg bg-muted/50 text-xs space-y-1">
              <p className="font-medium text-foreground">
                {activeVariants.length === 1
                  ? t('variant_available', { count: activeVariants.length })
                  : t('variants_available', { count: activeVariants.length })}
              </p>
              <p className="text-muted-foreground">
                {t('total_stock', { count: totalStock })}
              </p>
            </div>
          )}

          {!form.active && <Badge variant="secondary" className="text-[10px]">{t('inactive')}</Badge>}
          {form.visibility === 'draft' && <Badge variant="secondary" className="text-[10px] border-0">{t('draft_visibility')}</Badge>}
          {form.visibility === 'hidden' && <Badge variant="secondary" className="text-[10px] border-0">{t('hidden_visibility')}</Badge>}
        </div>
      </CardContent>
    </Card>
  )
}
