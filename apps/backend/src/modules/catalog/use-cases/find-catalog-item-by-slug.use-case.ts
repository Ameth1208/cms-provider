import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'
import { baseInclude, buildSeoMetadata } from '../catalog.helpers'
import type { CatalogItem as CatalogItemWithSeo } from '@cms/shared'

@Injectable()
export class FindCatalogItemBySlugUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(slug: string, organizationId: string): Promise<CatalogItemWithSeo> {
    const item = await this.prisma.catalogItem.findFirst({
      where: { slug, organizationId },
      include: { ...baseInclude, variants: true },
    })
    if (!item) throw new NotFoundException('Item not found')
    return { ...item, seo: buildSeoMetadata(item) } as unknown as CatalogItemWithSeo
  }
}
