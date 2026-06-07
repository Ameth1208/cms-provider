import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

interface Filters {
  status?: string
  driverId?: string
}

@Injectable()
export class FindAllDeliveriesUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(organizationId: string, filters?: Filters) {
    const where: any = {
      order: { organizationId },
    }

    if (filters?.status) where.status = filters.status
    if (filters?.driverId) where.driverId = filters.driverId

    return this.prisma.delivery.findMany({
      where,
      include: {
        order: {
          include: {
            items: true,
            customer: true,
          },
        },
        driver: true,
        _count: { select: { trackingEvents: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
