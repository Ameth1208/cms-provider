import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class GetExpiringBatchesUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(organizationId: string, days: number = 30) {
    const threshold = new Date()
    threshold.setDate(threshold.getDate() + days)

    return this.prisma.inventoryBatch.findMany({
      where: {
        inventory: { catalogItem: { organizationId } },
        expiresAt: { lte: threshold, gte: new Date() },
        remainingQuantity: { gt: 0 },
      },
      include: {
        inventory: { include: { catalogItem: { select: { id: true, name: true, sku: true } } } },
      },
      orderBy: { expiresAt: 'asc' },
    })
  }
}
