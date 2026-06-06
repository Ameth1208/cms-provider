import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'
import { CreateDriverDto } from './dto/create-driver.dto'
import { UpdateDriverDto } from './dto/update-driver.dto'

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string, active?: boolean) {
    const where: any = { organizationId }
    if (active !== undefined) where.active = active
    
    return this.prisma.driver.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, name: true } },
        _count: { select: { orders: true, deliveries: true } },
      },
      orderBy: { name: 'asc' },
    })
  }

  async findOne(id: string, organizationId: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { id, organizationId },
      include: {
        user: { select: { id: true, email: true, name: true } },
        orders: {
          where: { status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED'] } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        deliveries: {
          where: { status: { in: ['ASSIGNED', 'IN_PROGRESS', 'NEARBY'] } },
          include: { order: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    
    if (!driver) throw new NotFoundException('Driver not found')
    return driver
  }

  async getStats(organizationId: string) {
    const drivers = await this.prisma.driver.findMany({
      where: { organizationId },
      include: {
        deliveries: {
          where: { status: { in: ['COMPLETED', 'FAILED'] } },
          select: {
            status: true,
            startedAt: true,
            completedAt: true,
          },
        },
      },
    })

    const totalDrivers = drivers.length
    const activeDrivers = drivers.filter((d) => d.active).length

    let totalDeliveries = 0
    let totalCompleted = 0
    let totalFailed = 0
    let totalMinutes = 0

    drivers.forEach((driver) => {
      driver.deliveries.forEach((delivery) => {
        totalDeliveries++
        if (delivery.status === 'COMPLETED') {
          totalCompleted++
          if (delivery.startedAt && delivery.completedAt) {
            totalMinutes +=
              (delivery.completedAt.getTime() - delivery.startedAt.getTime()) / (1000 * 60)
          }
        } else if (delivery.status === 'FAILED') {
          totalFailed++
        }
      })
    })

    const avgDeliveryTime =
      totalCompleted > 0 ? Math.round(totalMinutes / totalCompleted) : 0
    const successRate =
      totalDeliveries > 0 ? Math.round((totalCompleted / totalDeliveries) * 100) : 0

    return {
      totalDrivers,
      activeDrivers,
      totalDeliveries,
      totalCompleted,
      totalFailed,
      avgDeliveryTime,
      successRate,
    }
  }

  async getDriverOrders(id: string, organizationId: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { id, organizationId },
    })
    if (!driver) throw new NotFoundException('Driver not found')

    return this.prisma.order.findMany({
      where: { driverId: id, organizationId },
      include: { items: true, customer: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(dto: CreateDriverDto, organizationId: string) {
    if (dto.userId) {
      const existing = await this.prisma.driver.findUnique({
        where: { userId: dto.userId },
      })
      if (existing) throw new BadRequestException('User already assigned to a driver')
    }

    return this.prisma.driver.create({
      data: { ...dto, organizationId },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    })
  }

  async update(id: string, dto: UpdateDriverDto, organizationId: string) {
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

  async remove(id: string, organizationId: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { id, organizationId },
    })
    if (!driver) throw new NotFoundException('Driver not found')

    await this.prisma.driver.delete({ where: { id } })
    return { deleted: true }
  }

  async updateLocation(id: string, lat: number, lng: number, organizationId: string) {
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
