import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'
import { CreateZoneDto, UpdateZoneDto } from './dto/zone.dto'

@Injectable()
export class DeliveryZonesService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.deliveryZone.findMany({
      where: { organizationId, active: true },
      orderBy: { name: 'asc' },
    })
  }

  async findOne(id: string, organizationId: string) {
    const zone = await this.prisma.deliveryZone.findFirst({
      where: { id, organizationId },
      include: {
        orders: {
          where: { status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED'] } },
          take: 5,
        },
      },
    })
    if (!zone) throw new NotFoundException('Zone not found')
    return zone
  }

  async create(dto: CreateZoneDto, organizationId: string) {
    return this.prisma.deliveryZone.create({
      data: { ...dto, organizationId },
    })
  }

  async update(id: string, dto: UpdateZoneDto, organizationId: string) {
    const zone = await this.prisma.deliveryZone.findFirst({
      where: { id, organizationId },
    })
    if (!zone) throw new NotFoundException('Zone not found')

    return this.prisma.deliveryZone.update({
      where: { id },
      data: dto,
    })
  }

  async remove(id: string, organizationId: string) {
    const zone = await this.prisma.deliveryZone.findFirst({
      where: { id, organizationId },
    })
    if (!zone) throw new NotFoundException('Zone not found')

    await this.prisma.deliveryZone.delete({ where: { id } })
    return { deleted: true }
  }
}
