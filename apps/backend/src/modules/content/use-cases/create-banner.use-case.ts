import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

interface CreateBannerData {
  sectionId?: string
  imageUrl?: string
  title?: string
  description?: string
  link?: string
  position?: string
  order?: number
}

@Injectable()
export class CreateBannerUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(data: CreateBannerData, organizationId: string) {
    return this.prisma.homepageBanner.create({
      data: { ...data, organizationId },
    })
  }
}
