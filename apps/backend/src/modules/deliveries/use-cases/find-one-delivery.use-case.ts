import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class FindOneDeliveryUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, organizationId: string) {
    const delivery = await this.prisma.delivery.findFirst({
      where: {
        id,
        order: { organizationId },
      },
      include: {
        order: {
          include: {
            items: true,
            customer: true,
          },
        },
        driver: true,
        trackingEvents: {
          orderBy: { timestamp: 'desc' },
        },
      },
    })

    if (!delivery) throw new NotFoundException('Delivery not found')
    return delivery
  }
}
