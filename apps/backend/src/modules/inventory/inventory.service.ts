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
      },
    })
    if (!inv) throw new NotFoundException('Inventory not found')
    return inv
  }

  async adjust(data: { catalogItemId: string; quantity: number; type: 'IN' | 'OUT' | 'ADJUSTMENT'; reason?: string }, organizationId: string) {
    const inv = await this.prisma.inventory.findFirst({
      where: { catalogItemId: data.catalogItemId, catalogItem: { organizationId } },
    })
    if (!inv) throw new NotFoundException('Inventory not found')

    if (data.type === 'OUT' && inv.quantity < data.quantity) {
      throw new BadRequestException('Insufficient stock')
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
      },
    })

    return this.prisma.inventory.update({
      where: { id: inv.id },
      data: { quantity: { increment: quantityChange } },
      include: { catalogItem: { select: { name: true, sku: true } } },
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
}
