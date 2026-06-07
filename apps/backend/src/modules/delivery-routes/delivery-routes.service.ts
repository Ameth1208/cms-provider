import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'
import { RouteStatus } from '@prisma/client'
import { CreateRouteDto, UpdateRouteDto } from './dto/route.dto'

@Injectable()
export class DeliveryRoutesService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string, filters?: { date?: string; status?: string }) {
    const where: any = { organizationId }
    
    if (filters?.status) where.status = filters.status
    if (filters?.date) {
      const date = new Date(filters.date)
      where.date = {
        gte: date,
        lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
      }
    }

    return this.prisma.deliveryRoute.findMany({
      where,
      include: {
        driver: true,
      },
      orderBy: { date: 'desc' },
    })
  }

  async findOne(id: string, organizationId: string) {
    const route = await this.prisma.deliveryRoute.findFirst({
      where: { id, organizationId },
      include: {
        driver: true,
      },
    })
    if (!route) throw new NotFoundException('Route not found')

    // Fetch orders in the route
    const orders = await this.prisma.order.findMany({
      where: {
        id: { in: route.orderIds },
        organizationId,
      },
      include: {
        items: true,
        customer: true,
        delivery: {
          include: {
            driver: true,
          },
        },
      },
    })

    return { ...route, orders }
  }

  async create(dto: CreateRouteDto, organizationId: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { id: dto.driverId, organizationId },
    })
    if (!driver) throw new NotFoundException('Driver not found')

    return this.prisma.deliveryRoute.create({
      data: {
        name: dto.name,
        driverId: dto.driverId,
        orderIds: dto.orderIds || [],
        notes: dto.notes,
        organizationId,
      },
      include: {
        driver: true,
      },
    })
  }

  async update(id: string, dto: UpdateRouteDto, organizationId: string) {
    const route = await this.prisma.deliveryRoute.findFirst({
      where: { id, organizationId },
    })
    if (!route) throw new NotFoundException('Route not found')

    return this.prisma.deliveryRoute.update({
      where: { id },
      data: dto,
      include: {
        driver: true,
      },
    })
  }

  async remove(id: string, organizationId: string) {
    const route = await this.prisma.deliveryRoute.findFirst({
      where: { id, organizationId },
    })
    if (!route) throw new NotFoundException('Route not found')

    await this.prisma.deliveryRoute.delete({ where: { id } })
    return { deleted: true }
  }

  async startRoute(id: string, organizationId: string) {
    const route = await this.prisma.deliveryRoute.findFirst({
      where: { id, organizationId },
    })
    if (!route) throw new NotFoundException('Route not found')

    return this.prisma.deliveryRoute.update({
      where: { id },
      data: {
        status: RouteStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    })
  }

  async completeRoute(id: string, organizationId: string) {
    const route = await this.prisma.deliveryRoute.findFirst({
      where: { id, organizationId },
    })
    if (!route) throw new NotFoundException('Route not found')

    return this.prisma.deliveryRoute.update({
      where: { id },
      data: {
        status: RouteStatus.COMPLETED,
        completedAt: new Date(),
      },
    })
  }
}
