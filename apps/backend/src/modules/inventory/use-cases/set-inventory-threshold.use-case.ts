import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class SetInventoryThresholdUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(catalogItemId: string, threshold: number, organizationId: string) {
    const inv = await this.prisma.inventory.findFirst({
      where: { catalogItemId, catalogItem: { organizationId } },
    })
    if (!inv) throw new NotFoundException('Inventory not found')

    return this.prisma.inventory.update({
      where: { id: inv.id },
      data: { lowStockThreshold: threshold },
    })
  }
}
