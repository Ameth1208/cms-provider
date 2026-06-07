import { Injectable, ConflictException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'
import { includeWithInventory, mapCatalogItemToDto } from '../catalog.helpers'
import type { CatalogItem as CatalogItemWithSeo } from '@cms/shared'

interface CreateCatalogItemData {
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
}

@Injectable()
export class CreateCatalogItemUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(data: CreateCatalogItemData, organizationId: string): Promise<CatalogItemWithSeo> {
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

    return mapCatalogItemToDto(item)
  }
}
