import { Injectable } from '@nestjs/common'
import { DeliveryStatus } from '@prisma/client'
import { PrismaService } from '@common/prisma.service'
import { UpdateDeliveryStatusDto } from '../dto/delivery.dto'
import { DeliveriesGateway } from '../deliveries.gateway'
import { FindOneDeliveryUseCase } from './find-one-delivery.use-case'

@Injectable()
export class UpdateDeliveryStatusUseCase {
  constructor(
    private prisma: PrismaService,
    private gateway: DeliveriesGateway,
    private findOneUseCase: FindOneDeliveryUseCase,
  ) {}

  async execute(id: string, dto: UpdateDeliveryStatusDto, organizationId: string) {
    const delivery = await this.findOneUseCase.execute(id, organizationId)

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
}
