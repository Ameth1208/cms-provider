import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'
import { includeWithInventory, buildSeoMetadata } from '../catalog.helpers'
import type { CatalogItem as CatalogItemWithSeo } from '@cms/shared'

@Injectable()
export class FindOneCatalogItemUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, organizationId: string): Promise<CatalogItemWithSeo> {
    const item = await this.prisma.catalogItem.findFirst({
      where: { id, organizationId },
      include: { ...includeWithInventory },
    })
    if (!item) throw new NotFoundException('Item not found')
    return { ...item, seo: buildSeoMetadata(item) } as unknown as CatalogItemWithSeo
  }
}
