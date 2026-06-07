import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class RemoveProductFromSectionUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, organizationId: string) {
    const spotlight = await this.prisma.homepageProductSpotlight.findFirst({
      where: { id, section: { organizationId } },
    })
    if (!spotlight) throw new NotFoundException('Spotlight not found')

    await this.prisma.homepageProductSpotlight.delete({ where: { id } })
    return { deleted: true }
  }
}
