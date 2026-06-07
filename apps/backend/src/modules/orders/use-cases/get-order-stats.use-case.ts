import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class GetOrderStatsUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(organizationId: string) {
    const [totalOrders, pendingOrders, processingOrders, shippedOrders, deliveredOrders, totalRevenue] = await Promise.all([
      this.prisma.order.count({ where: { organizationId } }),
      this.prisma.order.count({ where: { organizationId, status: 'PENDING' } }),
      this.prisma.order.count({ where: { organizationId, status: 'PROCESSING' } }),
      this.prisma.order.count({ where: { organizationId, status: 'SHIPPED' } }),
      this.prisma.order.count({ where: { organizationId, status: 'DELIVERED' } }),
      this.prisma.order.aggregate({
        where: { organizationId, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
    ])

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      totalRevenue: totalRevenue._sum.total || 0,
    }
  }
}
