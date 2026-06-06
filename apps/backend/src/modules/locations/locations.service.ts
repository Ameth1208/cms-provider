import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'
import { CreateLocationDto, UpdateLocationDto } from './dto/location.dto'

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.location.findMany({
      where: { organizationId, active: true },
      orderBy: { isMain: 'desc' },
    })
  }

  async findOne(id: string, organizationId: string) {
    const location = await this.prisma.location.findFirst({
      where: { id, organizationId },
    })
    if (!location) throw new NotFoundException('Location not found')
    return location
  }

  async create(dto: CreateLocationDto, organizationId: string) {
    if (dto.isMain) {
      await this.prisma.location.updateMany({
        where: { organizationId },
        data: { isMain: false },
      })
    }

    return this.prisma.location.create({
      data: { ...dto, organizationId },
    })
  }

  async update(id: string, dto: UpdateLocationDto, organizationId: string) {
    const location = await this.prisma.location.findFirst({
      where: { id, organizationId },
    })
    if (!location) throw new NotFoundException('Location not found')

    if (dto.isMain) {
      await this.prisma.location.updateMany({
        where: { organizationId },
        data: { isMain: false },
      })
    }

    return this.prisma.location.update({
      where: { id },
      data: dto,
    })
  }

  async remove(id: string, organizationId: string) {
    const location = await this.prisma.location.findFirst({
      where: { id, organizationId },
    })
    if (!location) throw new NotFoundException('Location not found')

    await this.prisma.location.update({
      where: { id },
      data: { active: false },
    })
    return { deleted: true }
  }
}
