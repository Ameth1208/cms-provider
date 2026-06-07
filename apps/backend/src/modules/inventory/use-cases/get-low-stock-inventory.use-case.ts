import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class GetLowStockInventoryUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(organizationId: string) {
    return this.prisma.inventory.findMany({
      where: {
        catalogItem: { organizationId },
        quantity: { lte: 0 },
      },
      include: { catalogItem: { select: { name: true, sku: true } } },
    })
  }
}
