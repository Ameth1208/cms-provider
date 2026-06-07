import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class RemoveCatalogItemUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, organizationId: string): Promise<void> {
    const item = await this.prisma.catalogItem.findFirst({ where: { id, organizationId } })
    if (!item) throw new NotFoundException('Item not found')

    await this.prisma.catalogItemVariant.deleteMany({ where: { catalogItemId: id } })
    await this.prisma.catalogItemTag.deleteMany({ where: { catalogItemId: id } })
    await this.prisma.media.deleteMany({ where: { catalogItemId: id } })
    await this.prisma.inventory.deleteMany({ where: { catalogItemId: id } })
    await this.prisma.catalogItem.delete({ where: { id } })
  }
}
