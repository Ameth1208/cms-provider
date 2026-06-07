import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'
import { includeWithInventory, mapCatalogItemToDto } from '../catalog.helpers'
import type { CatalogItem as CatalogItemWithSeo } from '@cms/shared'

@Injectable()
export class FindAllCatalogItemsUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(organizationId: string, query?: { search?: string; type?: string; categoryId?: string; tagId?: string }): Promise<CatalogItemWithSeo[]> {
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

    return items.map((item) => mapCatalogItemToDto(item))
  }
}
