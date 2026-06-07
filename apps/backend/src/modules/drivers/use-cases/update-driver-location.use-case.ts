import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class UpdateDriverLocationUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, lat: number, lng: number, organizationId: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { id, organizationId },
    })
    if (!driver) throw new NotFoundException('Driver not found')

    return this.prisma.driver.update({
      where: { id },
      data: {
        currentLat: lat,
        currentLng: lng,
        lastLocationAt: new Date(),
      },
    })
  }
}
