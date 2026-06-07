import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

interface UpdateBannerData {
  sectionId?: string | null
  imageUrl?: string
  title?: string
  description?: string
  link?: string
  position?: string
  order?: number
  active?: boolean
}

@Injectable()
export class UpdateBannerUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, data: UpdateBannerData, organizationId: string) {
    const banner = await this.prisma.homepageBanner.findFirst({
      where: { id, organizationId },
    })
    if (!banner) throw new NotFoundException('Banner not found')

    return this.prisma.homepageBanner.update({ where: { id }, data })
  }
}
