import { Injectable } from '@nestjs/common'
import { FindAllDeliveriesUseCase } from './use-cases/find-all-deliveries.use-case'
import { FindDeliveriesByDriverUseCase } from './use-cases/find-deliveries-by-driver.use-case'
import { FindOneDeliveryUseCase } from './use-cases/find-one-delivery.use-case'
import { CreateDeliveryUseCase } from './use-cases/create-delivery.use-case'
import { UpdateDeliveryStatusUseCase } from './use-cases/update-delivery-status.use-case'
import { AddTrackingEventUseCase } from './use-cases/add-tracking-event.use-case'
import { GetTrackingEventsUseCase } from './use-cases/get-tracking-events.use-case'
import { GetDeliveryStatsUseCase } from './use-cases/get-delivery-stats.use-case'
import { CompleteDeliveryUseCase } from './use-cases/complete-delivery.use-case'
import { CreateDeliveryDto, UpdateDeliveryStatusDto, CreateTrackingEventDto } from './dto/delivery.dto'

@Injectable()
export class DeliveriesService {
  constructor(
    private findAllUseCase: FindAllDeliveriesUseCase,
    private findByDriverUseCase: FindDeliveriesByDriverUseCase,
    private findOneUseCase: FindOneDeliveryUseCase,
    private createUseCase: CreateDeliveryUseCase,
    private updateStatusUseCase: UpdateDeliveryStatusUseCase,
    private addTrackingEventUseCase: AddTrackingEventUseCase,
    private getTrackingEventsUseCase: GetTrackingEventsUseCase,
    private getStatsUseCase: GetDeliveryStatsUseCase,
    private completeDeliveryUseCase: CompleteDeliveryUseCase,
  ) {}

  findAll(organizationId: string, filters?: { status?: string; driverId?: string }) {
    return this.findAllUseCase.execute(organizationId, filters)
  }

  findByDriver(userId: string, organizationId: string) {
    return this.findByDriverUseCase.execute(userId, organizationId)
  }

  findOne(id: string, organizationId: string) {
    return this.findOneUseCase.execute(id, organizationId)
  }

  create(dto: CreateDeliveryDto, organizationId: string) {
    return this.createUseCase.execute(dto, organizationId)
  }

  updateStatus(id: string, dto: UpdateDeliveryStatusDto, organizationId: string) {
    return this.updateStatusUseCase.execute(id, dto, organizationId)
  }

  addTrackingEvent(id: string, dto: CreateTrackingEventDto, organizationId: string) {
    return this.addTrackingEventUseCase.execute(id, dto, organizationId)
  }

  getTrackingEvents(id: string, organizationId: string) {
    return this.getTrackingEventsUseCase.execute(id, organizationId)
  }

  getStats(organizationId: string) {
    return this.getStatsUseCase.execute(organizationId)
  }

  completeDelivery(
    id: string,
    body: { photoUrl?: string; signatureUrl?: string; deliveredTo?: string; notes?: string },
    organizationId: string,
  ) {
    return this.completeDeliveryUseCase.execute(id, body, organizationId)
  }
}
