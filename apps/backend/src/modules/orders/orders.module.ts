import { Module } from '@nestjs/common'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'
import { OrdersPaymentsService } from './services/orders-payments.service'
import { OrdersCancellationService } from './services/orders-cancellation.service'
import { FindAllOrdersUseCase } from './use-cases/find-all-orders.use-case'
import { FindOneOrderUseCase } from './use-cases/find-one-order.use-case'
import { CreateOrderUseCase } from './use-cases/create-order.use-case'
import { UpdateOrderUseCase } from './use-cases/update-order.use-case'
import { GetOrderStatsUseCase } from './use-cases/get-order-stats.use-case'
import { AddOrderItemUseCase } from './use-cases/add-order-item.use-case'
import { RemoveOrderItemUseCase } from './use-cases/remove-order-item.use-case'
import { AssignDriverUseCase } from './use-cases/assign-driver.use-case'
import { UnassignDriverUseCase } from './use-cases/unassign-driver.use-case'
import { OrdersGateway } from './orders.gateway'

@Module({
  controllers: [OrdersController],
  providers: [
    // Service (orchestrator)
    OrdersService,
    // Specialized services
    OrdersPaymentsService,
    OrdersCancellationService,
    // Use Cases
    FindAllOrdersUseCase,
    FindOneOrderUseCase,
    CreateOrderUseCase,
    UpdateOrderUseCase,
    GetOrderStatsUseCase,
    AddOrderItemUseCase,
    RemoveOrderItemUseCase,
    AssignDriverUseCase,
    UnassignDriverUseCase,
    // Gateway
    OrdersGateway,
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
