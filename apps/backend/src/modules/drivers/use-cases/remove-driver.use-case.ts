import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class RemoveDriverUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, organizationId: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { id, organizationId },
    })
    if (!driver) throw new NotFoundException('Driver not found')

    await this.prisma.driver.delete({ where: { id } })
    return { deleted: true }
  }
}
