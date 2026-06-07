import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class FindOneDriverUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, organizationId: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { id, organizationId },
      include: {
        user: { select: { id: true, email: true, name: true } },
        orders: {
          where: { status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED'] } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        deliveries: {
          where: { status: { in: ['ASSIGNED', 'IN_PROGRESS', 'NEARBY'] } },
          include: { order: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!driver) throw new NotFoundException('Driver not found')
    return driver
  }
}
