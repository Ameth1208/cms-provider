import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'
import type { CatalogItem as CatalogItemWithSeo } from '@cms/shared'

type CatalogPrismaInclude = {
  tags: { include: { tag: true } }
  media: { orderBy: { order: 'asc' } }
  category: true
  inventory?: true
}

const baseInclude: CatalogPrismaInclude = {
  tags: { include: { tag: true } },
  media: { orderBy: { order: 'asc' } },
  category: true,
}

const includeWithInventory: CatalogPrismaInclude = {
  ...baseInclude,
  inventory: true,
}

function buildSeoMetadata(item: {
  name: string
  slug: string
  description?: string | null
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
  const desc = item.description
    ? item.description.length > 160
      ? item.description.slice(0, 157) + '...'
      : item.description
    : `${item.name} - ${tagNames.length ? tagNames.join(', ') : 'catálogo'}`

  return {
    title: `${item.name} | CMS Web Manager`,
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

    return items.map((item) => ({ ...item, seo: buildSeoMetadata(item) })) as unknown as CatalogItemWithSeo[]
  }

  async findBySlug(slug: string, organizationId: string): Promise<CatalogItemWithSeo> {
    const item = await this.prisma.catalogItem.findFirst({
      where: { slug, organizationId },
      include: { ...baseInclude },
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
    type: 'PRODUCT' | 'SERVICE'
    sku?: string
    categoryId?: string
    tagIds?: string[]
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
        type: data.type,
        sku: data.sku,
        categoryId: data.categoryId,
        organizationId,
        tags: data.tagIds?.length
          ? { create: data.tagIds.map((tagId) => ({ tagId })) }
          : undefined,
        inventory: {
          create: { quantity: 0, lowStockThreshold: 5 },
        },
      },
      include: { ...includeWithInventory },
    })

    return { ...item, seo: buildSeoMetadata(item) } as unknown as CatalogItemWithSeo
  }

  async update(id: string, data: {
    name?: string
    slug?: string
    description?: string
    price?: number
    type?: 'PRODUCT' | 'SERVICE'
    sku?: string
    active?: boolean
    categoryId?: string | null
    tagIds?: string[]
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

    const updated = await this.prisma.catalogItem.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        type: data.type,
        sku: data.sku,
        active: data.active,
        categoryId: data.categoryId,
      },
      include: { ...includeWithInventory },
    })

    return { ...updated, seo: buildSeoMetadata(updated) } as unknown as CatalogItemWithSeo
  }

  async remove(id: string, organizationId: string) {
    const item = await this.prisma.catalogItem.findFirst({ where: { id, organizationId } })
    if (!item) throw new NotFoundException('Item not found')

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
