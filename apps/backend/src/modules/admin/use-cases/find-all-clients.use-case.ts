import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma.service'

@Injectable()
export class FindAllClientsUseCase {
  constructor(private prisma: PrismaService) {}

  async execute() {
    return this.prisma.organization.findMany({
      where: {
        slug: { not: 'cms-cloud' },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        modulesEnabled: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            catalogItems: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
