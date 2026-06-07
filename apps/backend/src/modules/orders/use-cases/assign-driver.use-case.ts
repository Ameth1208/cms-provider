import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'
import { OrdersGateway } from '../orders.gateway'

@Injectable()
export class AssignDriverUseCase {
  constructor(
    private prisma: PrismaService,
    private gateway: OrdersGateway,
  ) {}

  async execute(id: string, driverId: string, organizationId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, organizationId },
    })
    if (!order) throw new NotFoundException('Order not found')

    const driver = await this.prisma.driver.findFirst({
      where: { id: driverId, organizationId },
    })
    if (!driver) throw new NotFoundException('Driver not found')

    const updated = await this.prisma.order.update({
      where: { id },
      data: { driverId },
      include: {
        items: true,
        driver: true,
        customer: true,
      },
    })

    this.gateway.emitOrderStatus(updated)
    return updated
  }
}
