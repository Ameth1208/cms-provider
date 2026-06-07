import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class DeleteSectionUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, organizationId: string) {
    const section = await this.prisma.homepageSection.findFirst({
      where: { id, organizationId },
    })
    if (!section) throw new NotFoundException('Section not found')

    await this.prisma.homepageSection.delete({ where: { id } })
    return { deleted: true }
  }
}
