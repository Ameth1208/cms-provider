import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'
import { CreateDeliveryDto } from '../dto/delivery.dto'
import { DeliveriesGateway } from '../deliveries.gateway'

@Injectable()
export class CreateDeliveryUseCase {
  constructor(
    private prisma: PrismaService,
    private gateway: DeliveriesGateway,
  ) {}

  async execute(dto: CreateDeliveryDto, organizationId: string) {
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
}
