import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'
import { CreateTrackingEventDto } from '../dto/delivery.dto'
import { DeliveriesGateway } from '../deliveries.gateway'
import { FindOneDeliveryUseCase } from './find-one-delivery.use-case'

@Injectable()
export class AddTrackingEventUseCase {
  constructor(
    private prisma: PrismaService,
    private gateway: DeliveriesGateway,
    private findOneUseCase: FindOneDeliveryUseCase,
  ) {}

  async execute(id: string, dto: CreateTrackingEventDto, organizationId: string) {
    await this.findOneUseCase.execute(id, organizationId)

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
}
