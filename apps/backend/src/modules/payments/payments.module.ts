import { Module } from '@nestjs/common'
import { PaymentsController } from './payments.controller'
import { PaymentsService } from './payments.service'
import { FindAllPaymentsUseCase } from './use-cases/find-all-payments.use-case'
import { FindOnePaymentUseCase } from './use-cases/find-one-payment.use-case'
import { CreatePaymentUseCase } from './use-cases/create-payment.use-case'
import { UpdatePaymentStatusUseCase } from './use-cases/update-payment-status.use-case'
import { UpdateOrderPaymentStatusUseCase } from './use-cases/update-order-payment-status.use-case'
import { RefundPaymentUseCase } from './use-cases/refund-payment.use-case'
import { GetPaymentStatsUseCase } from './use-cases/get-payment-stats.use-case'

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    FindAllPaymentsUseCase,
    FindOnePaymentUseCase,
    CreatePaymentUseCase,
    UpdatePaymentStatusUseCase,
    UpdateOrderPaymentStatusUseCase,
    RefundPaymentUseCase,
    GetPaymentStatsUseCase,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
