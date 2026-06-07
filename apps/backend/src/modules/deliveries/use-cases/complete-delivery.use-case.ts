import { Injectable } from '@nestjs/common'
import { DeliveryStatus } from '@prisma/client'
import { PrismaService } from '@common/prisma.service'
import { DeliveriesGateway } from '../deliveries.gateway'
import { FindOneDeliveryUseCase } from './find-one-delivery.use-case'

interface CompleteDeliveryBody {
  photoUrl?: string
  signatureUrl?: string
  deliveredTo?: string
  notes?: string
}

@Injectable()
export class CompleteDeliveryUseCase {
  constructor(
    private prisma: PrismaService,
    private gateway: DeliveriesGateway,
    private findOneUseCase: FindOneDeliveryUseCase,
  ) {}

  async execute(id: string, body: CompleteDeliveryBody, organizationId: string) {
    const delivery = await this.findOneUseCase.execute(id, organizationId)

    const updated = await this.prisma.delivery.update({
      where: { id },
      data: {
        status: DeliveryStatus.COMPLETED,
        completedAt: new Date(),
      },
    })

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
