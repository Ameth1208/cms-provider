import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class GetDriverOrdersUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, organizationId: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { id, organizationId },
    })
    if (!driver) throw new NotFoundException('Driver not found')

    return this.prisma.order.findMany({
      where: { driverId: id, organizationId },
      include: { items: true, customer: true },
      orderBy: { createdAt: 'desc' },
    })
  }
}
