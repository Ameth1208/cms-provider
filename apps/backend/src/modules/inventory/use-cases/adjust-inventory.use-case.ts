import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

export interface AdjustInventoryData {
  catalogItemId: string
  quantity: number
  type: 'IN' | 'OUT' | 'ADJUSTMENT'
  reason?: string
  batchNumber?: string
  costPerUnit?: number
  expiresAt?: string
  supplier?: string
}

@Injectable()
export class AdjustInventoryUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(data: AdjustInventoryData, organizationId: string, createdBy?: string) {
    const inv = await this.prisma.inventory.findFirst({
      where: { catalogItemId: data.catalogItemId, catalogItem: { organizationId } },
      include: { batches: { orderBy: { receivedAt: 'asc' } } },
    })
    if (!inv) throw new NotFoundException('Inventory not found')

    if (data.type === 'OUT') {
      if (inv.quantity < data.quantity) {
        throw new BadRequestException('Insufficient stock')
      }
      // FIFO: consume from oldest batches first
      let remaining = data.quantity
      for (const batch of inv.batches) {
        if (remaining <= 0) break
        const deduct = Math.min(batch.remainingQuantity, remaining)
        await this.prisma.inventoryBatch.update({
          where: { id: batch.id },
          data: { remainingQuantity: { decrement: deduct } },
        })
        remaining -= deduct
      }
    }

    let quantityChange: number
    if (data.type === 'OUT') {
      quantityChange = -data.quantity
    } else if (data.type === 'ADJUSTMENT') {
      quantityChange = data.quantity - inv.quantity
    } else {
      quantityChange = data.quantity
    }

    await this.prisma.stockMovement.create({
      data: {
        inventoryId: inv.id,
        type: data.type,
        quantity: data.quantity,
        reason: data.reason,
        createdBy,
      },
    })

    // Create batch for IN movements
    if (data.type === 'IN' && data.quantity > 0) {
      await this.prisma.inventoryBatch.create({
        data: {
          inventoryId: inv.id,
          batchNumber: data.batchNumber || `LOT-${Date.now()}`,
          quantity: data.quantity,
          remainingQuantity: data.quantity,
          costPerUnit: data.costPerUnit,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
          supplier: data.supplier,
          notes: data.reason,
          createdBy,
        },
      })
    }

    return this.prisma.inventory.update({
      where: { id: inv.id },
      data: { quantity: { increment: quantityChange } },
      include: { catalogItem: { select: { name: true, sku: true } }, batches: { orderBy: { receivedAt: 'asc' } } },
    })
  }
}
