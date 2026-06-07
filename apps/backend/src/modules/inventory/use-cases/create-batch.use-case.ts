import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

export interface CreateBatchData {
  catalogItemId: string
  batchNumber: string
  quantity: number
  costPerUnit?: number
  expiresAt?: string
  supplier?: string
  notes?: string
}

@Injectable()
export class CreateBatchUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(data: CreateBatchData, organizationId: string, createdBy?: string) {
    const inv = await this.prisma.inventory.findFirst({
      where: { catalogItemId: data.catalogItemId, catalogItem: { organizationId } },
    })
    if (!inv) throw new NotFoundException('Inventory not found')

    const batch = await this.prisma.inventoryBatch.create({
      data: {
        inventoryId: inv.id,
        batchNumber: data.batchNumber,
        quantity: data.quantity,
        remainingQuantity: data.quantity,
        costPerUnit: data.costPerUnit,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        supplier: data.supplier,
        notes: data.notes,
        createdBy,
      },
    })

    // Update inventory total
    await this.prisma.inventory.update({
      where: { id: inv.id },
      data: { quantity: { increment: data.quantity } },
    })

    // Create stock movement record
    await this.prisma.stockMovement.create({
      data: {
        inventoryId: inv.id,
        type: 'IN',
        quantity: data.quantity,
        reason: `Batch ${data.batchNumber} received`,
        createdBy,
      },
    })

    return batch
  }
}
