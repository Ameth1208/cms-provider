import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class ReorderBannersUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(orders: { id: string; order: number }[], organizationId: string) {
    await this.prisma.$transaction(
      orders.map((o) =>
        this.prisma.homepageBanner.updateMany({
          where: { id: o.id, organizationId },
          data: { order: o.order },
        }),
      ),
    )

    return this.prisma.homepageBanner.findMany({
      where: { organizationId },
      orderBy: { order: 'asc' },
    })
  }
}
