import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class GetPublicContentUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(organizationId: string) {
    return this.prisma.homepageSection.findMany({
      where: { organizationId, active: true },
      include: {
        slides: {
          where: { active: true },
          orderBy: { order: 'asc' },
        },
        spotlights: {
          orderBy: { order: 'asc' },
          include: {
            catalogItem: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                comparePrice: true,
                discountType: true,
                discountValue: true,
                media: { take: 1 },
              },
            },
          },
        },
        banners: {
          where: { active: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    })
  }
}
