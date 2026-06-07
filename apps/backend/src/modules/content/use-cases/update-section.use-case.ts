import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

interface UpdateSectionData {
  title?: string
  order?: number
  active?: boolean
}

@Injectable()
export class UpdateSectionUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, data: UpdateSectionData, organizationId: string) {
    const section = await this.prisma.homepageSection.findFirst({
      where: { id, organizationId },
    })
    if (!section) throw new NotFoundException('Section not found')

    return this.prisma.homepageSection.update({
      where: { id },
      data,
    })
  }
}
