import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class FindAllDriversUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(organizationId: string, active?: boolean) {
    const where: any = { organizationId }
    if (active !== undefined) where.active = active

    return this.prisma.driver.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, name: true } },
        _count: { select: { orders: true, deliveries: true } },
      },
      orderBy: { name: 'asc' },
    })
  }
}
