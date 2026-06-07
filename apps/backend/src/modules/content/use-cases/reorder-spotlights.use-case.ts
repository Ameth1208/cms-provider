import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class ReorderSpotlightsUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(sectionId: string, orders: { id: string; order: number }[], organizationId: string) {
    const section = await this.prisma.homepageSection.findFirst({
      where: { id: sectionId, organizationId },
    })
    if (!section) throw new NotFoundException('Section not found')

    await this.prisma.$transaction(
      orders.map((o) =>
        this.prisma.homepageProductSpotlight.update({
          where: { id: o.id },
          data: { order: o.order },
        }),
      ),
    )

    return this.prisma.homepageProductSpotlight.findMany({
      where: { sectionId },
      orderBy: { order: 'asc' },
    })
  }
}
