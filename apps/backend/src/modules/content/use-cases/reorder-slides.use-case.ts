import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class ReorderSlidesUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(sectionId: string, orders: { id: string; order: number }[], organizationId: string) {
    const section = await this.prisma.homepageSection.findFirst({
      where: { id: sectionId, organizationId },
    })
    if (!section) throw new NotFoundException('Section not found')

    await this.prisma.$transaction(
      orders.map((o) =>
        this.prisma.homepageSlide.updateMany({
          where: { id: o.id, sectionId },
          data: { order: o.order },
        }),
      ),
    )

    return this.prisma.homepageSlide.findMany({
      where: { sectionId },
      orderBy: { order: 'asc' },
    })
  }
}
