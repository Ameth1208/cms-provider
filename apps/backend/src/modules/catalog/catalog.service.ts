import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'
import type { CatalogItem as CatalogItemWithSeo } from '@cms/shared'

type CatalogPrismaInclude = {
  tags: { include: { tag: true } }
  media: { orderBy: { order: 'asc' } }
  category: true
  inventory?: true
  variants?: true
}

const baseInclude: CatalogPrismaInclude = {
  tags: { include: { tag: true } },
  media: { orderBy: { order: 'asc' } },
  category: true,
}

const includeWithInventory: CatalogPrismaInclude = {
  ...baseInclude,
  inventory: true,
  variants: true,
}

function buildSeoMetadata(item: {
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

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string, query?: { search?: string; type?: string; categoryId?: string; tagId?: string }): Promise<CatalogItemWithSeo[]> {
    const where: any = { organizationId }

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
        { brand: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    if (query?.type) where.type = query.type
    if (query?.categoryId) where.categoryId = query.categoryId
    if (query?.tagId) where.tags = { some: { tagId: query.tagId } }

    const items = await this.prisma.catalogItem.findMany({
      where,
      include: { ...includeWithInventory },
      orderBy: { createdAt: 'desc' },
    })

    return items.map((item) => ({ ...item, finalPrice: this.calculateFinalPrice(item), seo: buildSeoMetadata(item) })) as unknown as CatalogItemWithSeo[]
  }

  private calculateFinalPrice(item: any): number {
    if (!item.discountType || item.discountValue <= 0) return item.price
    if (item.discountType === 'PERCENTAGE') {
      return Math.round(item.price * (1 - item.discountValue / 100) * 100) / 100
    }
    return Math.max(0, Math.round((item.price - item.discountValue) * 100) / 100)
  }

  async findBySlug(slug: string, organizationId: string): Promise<CatalogItemWithSeo> {
    const item = await this.prisma.catalogItem.findFirst({
      where: { slug, organizationId },
      include: { ...baseInclude, variants: true },
    })
    if (!item) throw new NotFoundException('Item not found')
    return { ...item, seo: buildSeoMetadata(item) } as unknown as CatalogItemWithSeo
  }

  async findOne(id: string, organizationId: string): Promise<CatalogItemWithSeo> {
    const item = await this.prisma.catalogItem.findFirst({
      where: { id, organizationId },
      include: { ...includeWithInventory },
    })
    if (!item) throw new NotFoundException('Item not found')
    return { ...item, seo: buildSeoMetadata(item) } as unknown as CatalogItemWithSeo
  }

  async create(data: {
    name: string
    slug: string
    description?: string
    price: number
    comparePrice?: number
    discountType?: 'PERCENTAGE' | 'FIXED'
    discountValue?: number
    type: 'PRODUCT' | 'SERVICE'
    sku?: string
    barcode?: string
    active?: boolean
    visibility?: string
    featured?: boolean
    label?: string
    categoryId?: string
    tagIds?: string[]
    brand?: string
    material?: string
    gender?: string
    season?: string
    fit?: string
    weight?: number
    dimensions?: string
    country?: string
    careInstructions?: string
    metaTitle?: string
    metaDescription?: string
    variants?: { name: string; sku?: string; color?: string; colorHex?: string; size?: string; price?: number; stock?: number; active?: boolean }[]
  }, organizationId: string): Promise<CatalogItemWithSeo> {
    const existing = await this.prisma.catalogItem.findFirst({
      where: { slug: data.slug, organizationId },
    })
    if (existing) throw new ConflictException('Slug already exists')

    const item = await this.prisma.catalogItem.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        comparePrice: data.comparePrice,
        discountType: data.discountType || null,
        discountValue: data.discountType ? (data.discountValue ?? 0) : 0,
        type: data.type,
        sku: data.sku,
        barcode: data.barcode,
        active: data.active ?? true,
        visibility: data.visibility ?? 'visible',
        featured: data.featured ?? false,
        label: data.label,
        categoryId: data.categoryId,
        organizationId,
        brand: data.brand,
        material: data.material,
        gender: data.gender,
        season: data.season,
        fit: data.fit,
        weight: data.weight,
        dimensions: data.dimensions,
        country: data.country,
        careInstructions: data.careInstructions,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        tags: data.tagIds?.length
          ? { create: data.tagIds.map((tagId) => ({ tagId })) }
          : undefined,
        inventory: data.type === 'PRODUCT'
          ? { create: { quantity: 0, lowStockThreshold: 5 } }
          : undefined,
        variants: data.variants?.length
          ? { create: data.variants }
          : undefined,
      },
      include: { ...includeWithInventory },
    })

    return { ...item, finalPrice: this.calculateFinalPrice(item), seo: buildSeoMetadata(item) } as unknown as CatalogItemWithSeo
  }

  async update(id: string, data: {
    name?: string
    slug?: string
    description?: string
    price?: number
    comparePrice?: number
    discountType?: 'PERCENTAGE' | 'FIXED' | null
    discountValue?: number
    type?: 'PRODUCT' | 'SERVICE'
    sku?: string
    barcode?: string
    active?: boolean
    visibility?: string
    featured?: boolean
    label?: string
    categoryId?: string | null
    tagIds?: string[]
    brand?: string
    material?: string
    gender?: string
    season?: string
    fit?: string
    weight?: number
    dimensions?: string
    country?: string
    careInstructions?: string
    metaTitle?: string
    metaDescription?: string
    variants?: { id?: string; name: string; sku?: string; color?: string; colorHex?: string; size?: string; price?: number; stock?: number; active?: boolean }[]
  }, organizationId: string): Promise<CatalogItemWithSeo> {
    const item = await this.prisma.catalogItem.findFirst({ where: { id, organizationId } })
    if (!item) throw new NotFoundException('Item not found')

    if (data.slug && data.slug !== item.slug) {
      const existing = await this.prisma.catalogItem.findFirst({
        where: { slug: data.slug, organizationId, id: { not: id } },
      })
      if (existing) throw new ConflictException('Slug already exists')
    }

    if (data.tagIds) {
      await this.prisma.catalogItemTag.deleteMany({ where: { catalogItemId: id } })
      await this.prisma.catalogItemTag.createMany({
        data: data.tagIds.map((tagId) => ({ catalogItemId: id, tagId })),
      })
    }

    // Update variants: replace all
    if (data.variants !== undefined) {
      await this.prisma.catalogItemVariant.deleteMany({ where: { catalogItemId: id } })
      if (data.variants.length > 0) {
        await this.prisma.catalogItemVariant.createMany({
          data: data.variants.map((v) => {
            const { id: _id, ...rest } = v
            return { ...rest, catalogItemId: id }
          }),
        })
      }
    }

    const updated = await this.prisma.catalogItem.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        comparePrice: data.comparePrice,
        discountType: data.discountType || null,
        discountValue: data.discountType ? (data.discountValue ?? 0) : 0,
        type: data.type,
        sku: data.sku,
        barcode: data.barcode,
        active: data.active,
        visibility: data.visibility,
        featured: data.featured,
        label: data.label,
        categoryId: data.categoryId,
        brand: data.brand,
        material: data.material,
        gender: data.gender,
        season: data.season,
        fit: data.fit,
        weight: data.weight,
        dimensions: data.dimensions,
        country: data.country,
        careInstructions: data.careInstructions,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
      },
      include: { ...includeWithInventory },
    })

    return { ...updated, finalPrice: this.calculateFinalPrice(updated), seo: buildSeoMetadata(updated) } as unknown as CatalogItemWithSeo
  }

  async remove(id: string, organizationId: string) {
    const item = await this.prisma.catalogItem.findFirst({ where: { id, organizationId } })
    if (!item) throw new NotFoundException('Item not found')

    await this.prisma.catalogItemVariant.deleteMany({ where: { catalogItemId: id } })
    await this.prisma.catalogItemTag.deleteMany({ where: { catalogItemId: id } })
    await this.prisma.media.deleteMany({ where: { catalogItemId: id } })
    await this.prisma.inventory.deleteMany({ where: { catalogItemId: id } })
    await this.prisma.catalogItem.delete({ where: { id } })
  }

  async findAllTags(organizationId: string) {
    return this.prisma.tag.findMany({
      where: { organizationId },
      include: { _count: { select: { catalogItems: true } } },
    })
  }

  async createTag(data: { name: string; slug: string }, organizationId: string) {
    return this.prisma.tag.create({ data: { ...data, organizationId } })
  }

  async removeTag(id: string, organizationId: string) {
    const tag = await this.prisma.tag.findFirst({ where: { id, organizationId } })
    if (!tag) throw new NotFoundException('Tag not found')
    await this.prisma.catalogItemTag.deleteMany({ where: { tagId: id } })
    await this.prisma.tag.delete({ where: { id } })
  }

  async findAllCategories(organizationId: string) {
    return this.prisma.category.findMany({
      where: { organizationId },
      include: { children: true },
    })
  }

  async createCategory(data: { name: string; slug: string; parentId?: string }, organizationId: string) {
    return this.prisma.category.create({ data: { ...data, organizationId } })
  }

  async removeCategory(id: string, organizationId: string) {
    const cat = await this.prisma.category.findFirst({ where: { id, organizationId } })
    if (!cat) throw new NotFoundException('Category not found')
    await this.prisma.catalogItem.updateMany({ where: { categoryId: id }, data: { categoryId: null } })
    await this.prisma.category.delete({ where: { id } })
  }
}
