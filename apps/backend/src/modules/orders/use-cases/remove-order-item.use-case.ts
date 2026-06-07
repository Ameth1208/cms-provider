import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'
import { OrdersGateway } from '../orders.gateway'

@Injectable()
export class RemoveOrderItemUseCase {
  constructor(
    private prisma: PrismaService,
    private gateway: OrdersGateway,
  ) {}

  async execute(id: string, itemId: string, organizationId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, organizationId },
      include: { items: true }
    })
    if (!order) throw new NotFoundException('Order not found')

    await this.prisma.orderItem.delete({ where: { id: itemId } })

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
