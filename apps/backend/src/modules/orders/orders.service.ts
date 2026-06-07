import { Injectable } from '@nestjs/common'
import { FindAllOrdersUseCase } from './use-cases/find-all-orders.use-case'
import { FindOneOrderUseCase } from './use-cases/find-one-order.use-case'
import { CreateOrderUseCase } from './use-cases/create-order.use-case'
import { UpdateOrderUseCase } from './use-cases/update-order.use-case'
import { GetOrderStatsUseCase } from './use-cases/get-order-stats.use-case'
import { AddOrderItemUseCase } from './use-cases/add-order-item.use-case'
import { RemoveOrderItemUseCase } from './use-cases/remove-order-item.use-case'
import { AssignDriverUseCase } from './use-cases/assign-driver.use-case'
import { UnassignDriverUseCase } from './use-cases/unassign-driver.use-case'
import { OrdersPaymentsService } from './services/orders-payments.service'
import { OrdersCancellationService } from './services/orders-cancellation.service'

@Injectable()
export class OrdersService {
  constructor(
    private findAllUseCase: FindAllOrdersUseCase,
    private findOneUseCase: FindOneOrderUseCase,
    private createUseCase: CreateOrderUseCase,
    private updateUseCase: UpdateOrderUseCase,
    private getStatsUseCase: GetOrderStatsUseCase,
    private addItemUseCase: AddOrderItemUseCase,
    private removeItemUseCase: RemoveOrderItemUseCase,
    private assignDriverUseCase: AssignDriverUseCase,
    private unassignDriverUseCase: UnassignDriverUseCase,
    private paymentsService: OrdersPaymentsService,
    private cancellationService: OrdersCancellationService,
  ) {}

  // Queries
  findAll(organizationId: string, query?: any) {
    return this.findAllUseCase.execute(organizationId, query)
  }

  findOne(id: string, organizationId: string) {
    return this.findOneUseCase.execute(id, organizationId)
  }

  getStats(organizationId: string) {
    return this.getStatsUseCase.execute(organizationId)
  }

  // Commands
  create(data: any, organizationId: string) {
    return this.createUseCase.execute(data, organizationId)
  }

  update(id: string, data: any, organizationId: string) {
    return this.updateUseCase.execute(id, data, organizationId)
  }

  updateStatus(id: string, status: string, organizationId: string) {
    return this.updateUseCase.execute(id, { status }, organizationId)
  }

  addItem(id: string, data: any, organizationId: string) {
    return this.addItemUseCase.execute(id, data, organizationId)
  }

  removeItem(id: string, itemId: string, organizationId: string) {
    return this.removeItemUseCase.execute(id, itemId, organizationId)
  }

  assignDriver(id: string, driverId: string, organizationId: string) {
    return this.assignDriverUseCase.execute(id, driverId, organizationId)
  }

  unassignDriver(id: string, organizationId: string) {
    return this.unassignDriverUseCase.execute(id, organizationId)
  }

  // Delegated to specialized services
  addPayment(id: string, data: any, organizationId: string) {
    return this.paymentsService.addPayment(id, data, organizationId)
  }

  cancelOrder(id: string, data: any, organizationId: string) {
    return this.cancellationService.cancelOrder(id, data, organizationId)
  }
}
