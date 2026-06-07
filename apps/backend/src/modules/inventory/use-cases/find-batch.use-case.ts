import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class FindBatchUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(batchId: string, organizationId: string) {
    const batch = await this.prisma.inventoryBatch.findFirst({
      where: { id: batchId, inventory: { catalogItem: { organizationId } } },
      include: { inventory: { include: { catalogItem: { select: { id: true, name: true, sku: true } } } } },
    })
    if (!batch) throw new NotFoundException('Batch not found')
    return batch
  }
}
