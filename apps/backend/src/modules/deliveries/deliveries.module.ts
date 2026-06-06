import { Module } from '@nestjs/common'
import { DeliveriesController } from './deliveries.controller'
import { DeliveriesService } from './deliveries.service'
import { DeliveriesGateway } from './deliveries.gateway'
import { TrackingController } from './tracking.controller'

@Module({
  controllers: [DeliveriesController, TrackingController],
  providers: [DeliveriesService, DeliveriesGateway],
  exports: [DeliveriesService, DeliveriesGateway],
})
export class DeliveriesModule {}
