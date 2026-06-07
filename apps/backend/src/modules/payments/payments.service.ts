import { Injectable } from '@nestjs/common'
import { FindAllPaymentsUseCase } from './use-cases/find-all-payments.use-case'
import { FindOnePaymentUseCase } from './use-cases/find-one-payment.use-case'
import { CreatePaymentUseCase } from './use-cases/create-payment.use-case'
import { UpdatePaymentStatusUseCase } from './use-cases/update-payment-status.use-case'
import { RefundPaymentUseCase } from './use-cases/refund-payment.use-case'
import { GetPaymentStatsUseCase } from './use-cases/get-payment-stats.use-case'

@Injectable()
export class PaymentsService {
  constructor(
    private findAllUseCase: FindAllPaymentsUseCase,
    private findOneUseCase: FindOnePaymentUseCase,
    private createUseCase: CreatePaymentUseCase,
    private updateStatusUseCase: UpdatePaymentStatusUseCase,
    private refundUseCase: RefundPaymentUseCase,
    private getStatsUseCase: GetPaymentStatsUseCase,
  ) {}

  findAll(organizationId: string, query?: { status?: string; method?: string }) {
    return this.findAllUseCase.execute(organizationId, query)
  }

  findOne(id: string, organizationId: string) {
    return this.findOneUseCase.execute(id, organizationId)
  }

  create(data: {
    orderId: string
    method: string
    amount: number
    currency?: string
    reference?: string
    externalId?: string
  }, organizationId: string) {
    return this.createUseCase.execute(data, organizationId)
  }

  updateStatus(id: string, status: string, organizationId: string) {
    return this.updateStatusUseCase.execute(id, status, organizationId)
  }

  refund(id: string, amount: number, organizationId: string) {
    return this.refundUseCase.execute(id, amount, organizationId)
  }

  getStats(organizationId: string) {
    return this.getStatsUseCase.execute(organizationId)
  }
}
