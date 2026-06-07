import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'
import { OrdersGateway } from '../orders.gateway'

interface UpdateOrderData {
  status?: string
  paymentStatus?: string
  shippingStatus?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  shippingAddress?: string
  shippingCity?: string
  shippingState?: string
  shippingZip?: string
  shippingCountry?: string
  carrier?: string
  trackingNumber?: string
  notes?: string
  internalNotes?: string
}

@Injectable()
export class UpdateOrderUseCase {
  constructor(
    private prisma: PrismaService,
    private gateway: OrdersGateway,
  ) {}

  async execute(id: string, data: UpdateOrderData, organizationId: string) {
    const order = await this.prisma.order.findFirst({ where: { id, organizationId } })
    if (!order) throw new NotFoundException('Order not found')

    const updateData: any = { ...data }
    if (data.status === 'SHIPPED' && !order.shippedAt) {
      updateData.shippedAt = new Date()
      updateData.shippingStatus = 'SHIPPED'
    }
    if (data.status === 'DELIVERED' && !order.deliveredAt) {
      updateData.deliveredAt = new Date()
      updateData.shippingStatus = 'DELIVERED'
    }
    if (data.shippingStatus === 'IN_TRANSIT' && order.shippingStatus === 'PENDING') {
      updateData.shippedAt = new Date()
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: updateData,
      include: { items: true },
    })

    this.gateway.emitOrderStatus(updated)
    return updated
  }
}
