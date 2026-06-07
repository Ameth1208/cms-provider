import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class FindSectionsUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(organizationId: string, type?: string) {
    return this.prisma.homepageSection.findMany({
      where: { organizationId, ...(type ? { type } : {}) },
      include: {
        slides: { orderBy: { order: 'asc' } },
        spotlights: {
          orderBy: { order: 'asc' },
          include: { catalogItem: { select: { id: true, name: true, slug: true, price: true, media: { take: 1 } } } },
        },
        banners: { orderBy: { order: 'asc' } },
      },
      orderBy: { order: 'asc' },
    })
  }
}
