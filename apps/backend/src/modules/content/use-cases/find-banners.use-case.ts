import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class FindBannersUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(organizationId: string, position?: string) {
    return this.prisma.homepageBanner.findMany({
      where: { organizationId, ...(position ? { position } : {}) },
      orderBy: { order: 'asc' },
    })
  }
}
