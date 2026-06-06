import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'
import { DeliveryStatus } from '@prisma/client'
import { CreateDeliveryDto, UpdateDeliveryStatusDto, CreateTrackingEventDto } from './dto/delivery.dto'
import { DeliveriesGateway } from './deliveries.gateway'

@Injectable()
export class DeliveriesService {
  constructor(
    private prisma: PrismaService,
    private gateway: DeliveriesGateway,
  ) {}

  async findAll(organizationId: string, filters?: { status?: string; driverId?: string }) {
    const where: any = { 
      order: { organizationId },
    }
    
    if (filters?.status) where.status = filters.status
    if (filters?.driverId) where.driverId = filters.driverId

    return this.prisma.delivery.findMany({
      where,
      include: {
        order: {
          include: {
            items: true,
            customer: true,
          },
        },
        driver: true,
        _count: { select: { trackingEvents: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findByDriver(userId: string, organizationId: string) {
    // Find driver by userId first
    const driver = await this.prisma.driver.findFirst({
      where: { userId, organizationId },
    })
    
    if (!driver) return []

    return this.prisma.delivery.findMany({
      where: {
        driverId: driver.id,
        status: { in: ['ASSIGNED', 'IN_PROGRESS', 'NEARBY'] },
      },
      include: {
        order: {
          include: {
            items: true,
            customer: true,
          },
        },
        trackingEvents: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: { assignedAt: 'desc' },
    })
  }

  async findOne(id: string, organizationId: string) {
    const delivery = await this.prisma.delivery.findFirst({
      where: {
        id,
        order: { organizationId },
      },
      include: {
        order: {
          include: {
            items: true,
            customer: true,
          },
        },
        driver: true,
        trackingEvents: {
          orderBy: { timestamp: 'desc' },
        },
      },
    })
    
    if (!delivery) throw new NotFoundException('Delivery not found')
    return delivery
  }

  async create(dto: CreateDeliveryDto, organizationId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, organizationId },
    })
    if (!order) throw new NotFoundException('Order not found')

    const driver = await this.prisma.driver.findFirst({
      where: { id: dto.driverId, organizationId },
    })
    if (!driver) throw new NotFoundException('Driver not found')

    const existing = await this.prisma.delivery.findUnique({
      where: { orderId: dto.orderId },
    })
    if (existing) throw new BadRequestException('Delivery already exists for this order')

    // Update order with driver
    await this.prisma.order.update({
      where: { id: dto.orderId },
      data: { driverId: dto.driverId },
    })

    const delivery = await this.prisma.delivery.create({
      data: {
        orderId: dto.orderId,
        driverId: dto.driverId,
        notes: dto.notes,
      },
      include: {
        order: true,
        driver: true,
      },
    })

    this.gateway.emitDeliveryAssigned(delivery)
    return delivery
  }

  async updateStatus(id: string, dto: UpdateDeliveryStatusDto, organizationId: string) {
    const delivery = await this.findOne(id, organizationId)

    const updateData: any = { status: dto.status }
    
    if (dto.status === DeliveryStatus.IN_PROGRESS && !delivery.startedAt) {
      updateData.startedAt = new Date()
    }
    
    if (dto.status === DeliveryStatus.COMPLETED) {
      updateData.completedAt = new Date()
    }
    
    if (dto.status === DeliveryStatus.FAILED) {
      updateData.failedAt = new Date()
      updateData.failureReason = dto.failureReason
    }

    const updated = await this.prisma.delivery.update({
      where: { id },
      data: updateData,
      include: {
        order: true,
        driver: true,
      },
    })

    // Emit WebSocket events based on status
    if (dto.status === DeliveryStatus.IN_PROGRESS) {
      this.gateway.emitDeliveryStarted(updated)
    } else if (dto.status === DeliveryStatus.NEARBY) {
      this.gateway.emitDeliveryNearby(updated)
    } else if (dto.status === DeliveryStatus.COMPLETED) {
      this.gateway.emitDeliveryCompleted(updated)
    } else if (dto.status === DeliveryStatus.FAILED) {
      this.gateway.emitDeliveryFailed(updated)
    }

    return updated
  }

  async addTrackingEvent(id: string, dto: CreateTrackingEventDto, organizationId: string) {
    const delivery = await this.findOne(id, organizationId)

    const event = await this.prisma.trackingEvent.create({
      data: {
        deliveryId: id,
        status: dto.status,
        latitude: dto.latitude,
        longitude: dto.longitude,
        address: dto.address,
        notes: dto.notes,
      },
      include: {
        delivery: {
          include: {
            order: true,
          },
        },
      },
    })

    this.gateway.emitTrackingUpdate(event)
    return event
  }

  async getTrackingEvents(id: string, organizationId: string) {
    const delivery = await this.findOne(id, organizationId)

    return this.prisma.trackingEvent.findMany({
      where: { deliveryId: id },
      orderBy: { timestamp: 'desc' },
    })
  }

  async getStats(organizationId: string) {
    const [
      total,
      assigned,
      inProgress,
      completed,
      failed,
      avgDeliveryTime,
    ] = await Promise.all([
      this.prisma.delivery.count({
        where: { order: { organizationId } },
      }),
      this.prisma.delivery.count({
        where: { order: { organizationId }, status: DeliveryStatus.ASSIGNED },
      }),
      this.prisma.delivery.count({
        where: { order: { organizationId }, status: DeliveryStatus.IN_PROGRESS },
      }),
      this.prisma.delivery.count({
        where: { order: { organizationId }, status: DeliveryStatus.COMPLETED },
      }),
      this.prisma.delivery.count({
        where: { order: { organizationId }, status: DeliveryStatus.FAILED },
      }),
      this.prisma.delivery.findMany({
        where: {
          order: { organizationId },
          status: DeliveryStatus.COMPLETED,
          startedAt: { not: null },
          completedAt: { not: null },
        },
        select: {
          startedAt: true,
          completedAt: true,
        },
      }),
    ])

    // Calculate average delivery time in minutes
    let avgTimeMinutes = 0
    if (avgDeliveryTime.length > 0) {
      const totalMinutes = avgDeliveryTime.reduce((sum, d) => {
        if (d.startedAt && d.completedAt) {
          return sum + (d.completedAt.getTime() - d.startedAt.getTime()) / (1000 * 60)
        }
        return sum
      }, 0)
      avgTimeMinutes = Math.round(totalMinutes / avgDeliveryTime.length)
    }

    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      total,
      assigned,
      inProgress,
      completed,
      failed,
      successRate,
      avgTimeMinutes,
    }
  }

  async completeDelivery(
    id: string,
    body: { photoUrl?: string; signatureUrl?: string; deliveredTo?: string; notes?: string },
    organizationId: string,
  ) {
    const delivery = await this.findOne(id, organizationId)

    // Update delivery
    const updated = await this.prisma.delivery.update({
      where: { id },
      data: {
        status: DeliveryStatus.COMPLETED,
        completedAt: new Date(),
      },
    })

    // Update order proof of delivery
    await this.prisma.order.update({
      where: { id: delivery.orderId },
      data: {
        status: 'DELIVERED',
        proofOfDelivery: JSON.stringify(body),
        deliveredAt: new Date(),
      },
    })

    this.gateway.emitDeliveryCompleted(updated)
    return updated
  }
}
