import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class GetInventoryMovementsUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(catalogItemId: string, organizationId: string) {
    const inv = await this.prisma.inventory.findFirst({
      where: { catalogItemId, catalogItem: { organizationId } },
    })
    if (!inv) throw new NotFoundException('Inventory not found')

    return this.prisma.stockMovement.findMany({
      where: { inventoryId: inv.id },
      orderBy: { createdAt: 'desc' },
    })
  }
}
