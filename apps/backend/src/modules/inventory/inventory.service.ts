import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.inventory.findMany({
      where: { catalogItem: { organizationId } },
      include: {
        catalogItem: { select: { id: true, name: true, sku: true, active: true } },
      },
    })
  }

  async findByCatalogItem(catalogItemId: string, organizationId: string) {
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

  async adjust(data: { catalogItemId: string; quantity: number; type: 'IN' | 'OUT' | 'ADJUSTMENT'; reason?: string; batchNumber?: string; costPerUnit?: number; expiresAt?: string; supplier?: string }, organizationId: string, createdBy?: string) {
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

  async setThreshold(catalogItemId: string, threshold: number, organizationId: string) {
    const inv = await this.prisma.inventory.findFirst({
      where: { catalogItemId, catalogItem: { organizationId } },
    })
    if (!inv) throw new NotFoundException('Inventory not found')

    return this.prisma.inventory.update({
      where: { id: inv.id },
      data: { lowStockThreshold: threshold },
    })
  }

  async getLowStock(organizationId: string) {
    return this.prisma.inventory.findMany({
      where: {
        catalogItem: { organizationId },
        quantity: { lte: 0 },
      },
      include: { catalogItem: { select: { name: true, sku: true } } },
    })
  }

  async getMovements(catalogItemId: string, organizationId: string) {
    const inv = await this.prisma.inventory.findFirst({
      where: { catalogItemId, catalogItem: { organizationId } },
    })
    if (!inv) throw new NotFoundException('Inventory not found')

    return this.prisma.stockMovement.findMany({
      where: { inventoryId: inv.id },
      orderBy: { createdAt: 'desc' },
    })
  }

  // ─── Batches ───

  async findBatches(catalogItemId: string, organizationId: string) {
    const inv = await this.prisma.inventory.findFirst({
      where: { catalogItemId, catalogItem: { organizationId } },
      include: { batches: { orderBy: { receivedAt: 'asc' } } },
    })
    if (!inv) throw new NotFoundException('Inventory not found')
    return inv.batches
  }

  async createBatch(data: {
    catalogItemId: string
    batchNumber: string
    quantity: number
    costPerUnit?: number
    expiresAt?: string
    supplier?: string
    notes?: string
  }, organizationId: string, createdBy?: string) {
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

  async findBatch(batchId: string, organizationId: string) {
    const batch = await this.prisma.inventoryBatch.findFirst({
      where: { id: batchId, inventory: { catalogItem: { organizationId } } },
      include: { inventory: { include: { catalogItem: { select: { id: true, name: true, sku: true } } } } },
    })
    if (!batch) throw new NotFoundException('Batch not found')
    return batch
  }

  async deleteBatch(batchId: string, organizationId: string) {
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

  async getExpiringBatches(organizationId: string, days: number = 30) {
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
