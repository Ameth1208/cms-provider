import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class FindInventoryByCatalogItemUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(catalogItemId: string, organizationId: string) {
    const inv = await this.prisma.inventory.findFirst({
      where: { catalogItemId, catalogItem: { organizationId } },
      include: {
        catalogItem: { select: { id: true, name: true, sku: true } },
        movements: { orderBy: { createdAt: 'desc' }, take: 20 },
        batches: { orderBy: { receivedAt: 'asc' } },
      },
    })
    if (!inv) throw new NotFoundException('Inventory not found')
    return inv
  }
}
