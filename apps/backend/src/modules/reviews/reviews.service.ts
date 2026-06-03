import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async findAll(catalogItemId: string, organizationId: string) {
    return this.prisma.review.findMany({
      where: { catalogItemId, organizationId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(data: {
    catalogItemId: string
    userName: string
    userEmail?: string
    rating: number
    comment: string
  }, organizationId: string) {
    const item = await this.prisma.catalogItem.findFirst({
      where: { id: data.catalogItemId, organizationId },
    })
    if (!item) throw new NotFoundException('Item not found')

    return this.prisma.review.create({
      data: {
        catalogItemId: data.catalogItemId,
        userName: data.userName,
        userEmail: data.userEmail,
        rating: Math.max(1, Math.min(5, data.rating)),
        comment: data.comment,
        organizationId,
      },
    })
  }

  async remove(id: string, organizationId: string) {
    const review = await this.prisma.review.findFirst({ where: { id, organizationId } })
    if (!review) throw new NotFoundException('Review not found')
    await this.prisma.review.delete({ where: { id } })
  }
}
