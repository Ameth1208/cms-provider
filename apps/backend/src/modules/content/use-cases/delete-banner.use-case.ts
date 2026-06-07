import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class DeleteBannerUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, organizationId: string) {
    const banner = await this.prisma.homepageBanner.findFirst({
      where: { id, organizationId },
    })
    if (!banner) throw new NotFoundException('Banner not found')

    await this.prisma.homepageBanner.delete({ where: { id } })
    return { deleted: true }
  }
}
