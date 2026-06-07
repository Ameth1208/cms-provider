import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class FindOneOrderUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, organizationId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, organizationId },
      include: { 
        items: true,
        customer: {
          include: {
            addresses: true,
          }
        },
        shippingMethod: true,
        payments: {
          orderBy: { createdAt: 'desc' }
        },
        driver: true,
        delivery: {
          include: {
            trackingEvents: {
              orderBy: { timestamp: 'desc' },
            },
          },
        },
      },
    })
    
    if (!order) throw new NotFoundException('Order not found')
    return order
  }
}
