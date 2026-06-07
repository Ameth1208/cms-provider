import { Module } from '@nestjs/common'
import { DeliveriesController } from './deliveries.controller'
import { DeliveriesService } from './deliveries.service'
import { DeliveriesGateway } from './deliveries.gateway'
import { TrackingController } from './tracking.controller'
import { FindAllDeliveriesUseCase } from './use-cases/find-all-deliveries.use-case'
import { FindDeliveriesByDriverUseCase } from './use-cases/find-deliveries-by-driver.use-case'
import { FindOneDeliveryUseCase } from './use-cases/find-one-delivery.use-case'
import { CreateDeliveryUseCase } from './use-cases/create-delivery.use-case'
import { UpdateDeliveryStatusUseCase } from './use-cases/update-delivery-status.use-case'
import { AddTrackingEventUseCase } from './use-cases/add-tracking-event.use-case'
import { GetTrackingEventsUseCase } from './use-cases/get-tracking-events.use-case'
import { GetDeliveryStatsUseCase } from './use-cases/get-delivery-stats.use-case'
import { CompleteDeliveryUseCase } from './use-cases/complete-delivery.use-case'

@Module({
  controllers: [DeliveriesController, TrackingController],
  providers: [
    DeliveriesService,
    DeliveriesGateway,
    FindAllDeliveriesUseCase,
    FindDeliveriesByDriverUseCase,
    FindOneDeliveryUseCase,
    CreateDeliveryUseCase,
    UpdateDeliveryStatusUseCase,
    AddTrackingEventUseCase,
    GetTrackingEventsUseCase,
    GetDeliveryStatsUseCase,
    CompleteDeliveryUseCase,
  ],
  exports: [DeliveriesService, DeliveriesGateway],
})
export class DeliveriesModule {}
