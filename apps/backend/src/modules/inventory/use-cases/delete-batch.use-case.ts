import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class DeleteBatchUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(batchId: string, organizationId: string) {
    const batch = await this.prisma.inventoryBatch.findFirst({
      where: { id: batchId, inventory: { catalogItem: { organizationId } } },
    })
    if (!batch) throw new NotFoundException('Batch not found')

    if (batch.remainingQuantity < batch.quantity) {
      throw new BadRequestException('Cannot delete batch that has been partially consumed')
    }

    await this.prisma.inventoryBatch.delete({ where: { id: batchId } })

    // Revert inventory quantity
    await this.prisma.inventory.update({
      where: { id: batch.inventoryId },
      data: { quantity: { decrement: batch.quantity } },
    })

    return { deleted: true }
  }
}
