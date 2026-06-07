import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class DeleteSlideUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, organizationId: string) {
    const slide = await this.prisma.homepageSlide.findFirst({
      where: { id, section: { organizationId } },
    })
    if (!slide) throw new NotFoundException('Slide not found')

    await this.prisma.homepageSlide.delete({ where: { id } })
    return { deleted: true }
  }
}
