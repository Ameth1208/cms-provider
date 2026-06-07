import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'
import { FindOneDeliveryUseCase } from './find-one-delivery.use-case'

@Injectable()
export class GetTrackingEventsUseCase {
  constructor(
    private prisma: PrismaService,
    private findOneUseCase: FindOneDeliveryUseCase,
  ) {}

  async execute(id: string, organizationId: string) {
    await this.findOneUseCase.execute(id, organizationId)

    return this.prisma.trackingEvent.findMany({
      where: { deliveryId: id },
      orderBy: { timestamp: 'desc' },
    })
  }
}
