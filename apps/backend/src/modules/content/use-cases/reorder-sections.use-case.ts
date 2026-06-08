import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class ReorderSectionsUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(orders: { id: string; order: number }[], organizationId: string) {
    await this.prisma.$transaction(
      orders.map((o) =>
        this.prisma.homepageSection.updateMany({
          where: { id: o.id, organizationId },
          data: { order: o.order },
        }),
      ),
    )

    return this.prisma.homepageSection.findMany({
      where: { organizationId },
      orderBy: { order: 'asc' },
    })
  }
}
