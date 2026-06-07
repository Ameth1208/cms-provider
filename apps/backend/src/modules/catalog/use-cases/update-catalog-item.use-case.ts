import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'
import { includeWithInventory, mapCatalogItemToDto } from '../catalog.helpers'
import type { CatalogItem as CatalogItemWithSeo } from '@cms/shared'

interface UpdateCatalogItemData {
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
}

@Injectable()
export class UpdateCatalogItemUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, data: UpdateCatalogItemData, organizationId: string): Promise<CatalogItemWithSeo> {
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

    return mapCatalogItemToDto(updated)
  }
}
