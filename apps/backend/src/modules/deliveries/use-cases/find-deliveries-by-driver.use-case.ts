import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class FindDeliveriesByDriverUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string, organizationId: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { userId, organizationId },
    })

    if (!driver) return []

    return this.prisma.delivery.findMany({
      where: {
        driverId: driver.id,
        status: { in: ['ASSIGNED', 'IN_PROGRESS', 'NEARBY'] },
      },
      include: {
        order: {
          include: {
            items: true,
            customer: true,
          },
        },
        trackingEvents: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: { assignedAt: 'desc' },
    })
  }
}
