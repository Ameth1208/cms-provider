import type { CatalogItem as CatalogItemWithSeo } from '@cms/shared'

export type CatalogPrismaInclude = {
  tags: { include: { tag: true } }
  media: { orderBy: { order: 'asc' } }
  category: true
  inventory?: true
  variants?: true
}

export const baseInclude: CatalogPrismaInclude = {
  tags: { include: { tag: true } },
  media: { orderBy: { order: 'asc' } },
  category: true,
}

export const includeWithInventory: CatalogPrismaInclude = {
  ...baseInclude,
  inventory: true,
  variants: true,
}

export function buildSeoMetadata(item: {
  name: string
  slug: string
  description?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  tags?: { tag: { name: string } }[]
  media?: { url: string }[]
  category?: { name: string } | null
}): {
  title: string
  description: string
  keywords: string[]
  ogImage: string | null
  ogType: 'website' | 'article'
  canonical: string
} {
  const tagNames = item.tags?.map((t) => t.tag.name) ?? []
  const desc = item.metaDescription
    ? item.metaDescription
    : item.description
      ? item.description.length > 160
        ? item.description.slice(0, 157) + '...'
        : item.description
      : `${item.name} - ${tagNames.length ? tagNames.join(', ') : 'catálogo'}`

  return {
    title: item.metaTitle || `${item.name} | CMS Web Manager`,
    description: desc,
    keywords: [...tagNames, item.category?.name].filter(Boolean) as string[],
    ogImage: item.media?.[0]?.url ?? null,
    ogType: 'article',
    canonical: `/catalog/${item.slug}`,
  }
}

export function calculateFinalPrice(item: {
  price: number
  discountType?: string | null
  discountValue?: number | null
}): number {
  if (!item.discountType || (item.discountValue ?? 0) <= 0) return item.price
  if (item.discountType === 'PERCENTAGE') {
    return Math.round(item.price * (1 - (item.discountValue ?? 0) / 100) * 100) / 100
  }
  return Math.max(0, Math.round((item.price - (item.discountValue ?? 0)) * 100) / 100)
}

export function mapCatalogItemToDto(item: any): CatalogItemWithSeo {
  return {
    ...item,
    finalPrice: calculateFinalPrice(item),
    seo: buildSeoMetadata(item),
  } as unknown as CatalogItemWithSeo
}
