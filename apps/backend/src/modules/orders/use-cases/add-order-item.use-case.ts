import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'
import { OrdersGateway } from '../orders.gateway'

@Injectable()
export class AddOrderItemUseCase {
  constructor(
    private prisma: PrismaService,
    private gateway: OrdersGateway,
  ) {}

  async execute(id: string, data: { catalogItemId: string; quantity: number }, organizationId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, organizationId },
      include: { items: true }
    })
    if (!order) throw new NotFoundException('Order not found')

    const catalogItem = await this.prisma.catalogItem.findFirst({
      where: { id: data.catalogItemId, organizationId }
    })
    if (!catalogItem) throw new NotFoundException('Catalog item not found')

    await this.prisma.orderItem.create({
      data: {
        orderId: id,
        catalogItemId: data.catalogItemId,
        catalogItemName: catalogItem.name,
        quantity: data.quantity,
        unitPrice: catalogItem.price,
        totalPrice: catalogItem.price * data.quantity,
      }
    })

    // Recalculate totals
    const allItems = await this.prisma.orderItem.findMany({ where: { orderId: id } })
    const subtotal = allItems.reduce((sum, i) => sum + i.totalPrice, 0)
    const total = subtotal - order.discount + order.shippingCost

    const updated = await this.prisma.order.update({
      where: { id },
      data: { subtotal, total },
      include: { items: true }
    })

    this.gateway.emitOrderStatus(updated)
    return updated
  }
}
