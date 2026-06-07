import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'
import { UpdateDriverDto } from '../dto/update-driver.dto'

@Injectable()
export class UpdateDriverUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, dto: UpdateDriverDto, organizationId: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { id, organizationId },
    })
    if (!driver) throw new NotFoundException('Driver not found')

    return this.prisma.driver.update({
      where: { id },
      data: {
        ...dto,
        lastLocationAt: dto.currentLat !== undefined ? new Date() : undefined,
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    })
  }
}
