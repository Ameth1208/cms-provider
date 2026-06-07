import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class FindAllInventoryUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(organizationId: string) {
    return this.prisma.inventory.findMany({
      where: { catalogItem: { organizationId } },
      include: {
        catalogItem: { select: { id: true, name: true, sku: true, active: true } },
      },
    })
  }
}
