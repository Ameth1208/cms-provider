import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class FindAllTagsUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(organizationId: string) {
    return this.prisma.tag.findMany({
      where: { organizationId },
      include: { _count: { select: { catalogItems: true } } },
    })
  }
}
