import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'
import { OrdersGateway } from '../orders.gateway'

@Injectable()
export class OrdersCancellationService {
  constructor(
    private prisma: PrismaService,
    private gateway: OrdersGateway,
  ) {}

  async cancelOrder(
    id: string, 
    data: { reason?: string }, 
    organizationId: string
  ) {
    // 1. Fetch order with payments and items
    const order = await this.prisma.order.findFirst({
      where: { id, organizationId },
      include: { 
        items: true,
        payments: true 
      }
    })
    
    if (!order) throw new NotFoundException('Order not found')
    if (order.status === 'CANCELLED') throw new BadRequestException('Order already cancelled')
    if (order.status === 'DELIVERED') throw new BadRequestException('Cannot cancel delivered orders')
    
    // 2. Calculate refund amount based on shipping status
    let refundAmount = 0
    const totalPaid = order.payments
      .filter((p: any) => p.status === 'PAID')
      .reduce((sum: number, p: any) => sum + p.amount, 0)
    
    if (order.shippingStatus === 'PENDING' || order.shippingStatus === 'READY') {
      // Order not shipped yet - full refund including shipping
      refundAmount = Math.min(totalPaid, order.total)
    } else if (['SHIPPED', 'IN_TRANSIT'].includes(order.shippingStatus)) {
      // Order already shipped - refund only subtotal + tax (not shipping)
      const nonShippingAmount = order.subtotal + order.tax - order.discount
      refundAmount = Math.min(totalPaid, nonShippingAmount)
    }
    
    // 3. Create refund payment record if there's amount to refund
    if (refundAmount > 0) {
      await this.prisma.payment.create({
        data: {
          orderId: id,
          method: 'OTHER',
          amount: -refundAmount,
          status: 'REFUNDED',
          currency: 'COP',
          reference: `Cancelación: ${data.reason || 'Sin motivo'}`,
          refundedAt: new Date(),
        }
      })
    }
    
    // 4. Restore inventory
    for (const item of order.items) {
      if (item.catalogItemId) {
        await this.prisma.inventory.updateMany({
          where: { catalogItemId: item.catalogItemId },
          data: {
            quantity: {
              increment: item.quantity
            }
          }
        })
      }
    }
    
    // 5. Update order status
    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        paymentStatus: refundAmount >= totalPaid ? 'REFUNDED' : 'PARTIAL',
        cancelledAt: new Date(),
        cancellationReason: data.reason,
        refundedAmount: refundAmount,
      },
      include: {
        items: true,
        payments: true,
        shippingMethod: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
      }
    })
    
    this.gateway.emitOrderStatus(updated)
    return updated
  }
}
