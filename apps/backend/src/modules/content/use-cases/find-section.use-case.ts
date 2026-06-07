import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class FindSectionUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, organizationId: string) {
    const section = await this.prisma.homepageSection.findFirst({
      where: { id, organizationId },
      include: {
        slides: { orderBy: { order: 'asc' } },
        spotlights: {
          orderBy: { order: 'asc' },
          include: { catalogItem: { select: { id: true, name: true, slug: true, price: true, media: { take: 1 } } } },
        },
        banners: { orderBy: { order: 'asc' } },
      },
    })
    if (!section) throw new NotFoundException('Section not found')
    return section
  }
}
