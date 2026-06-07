import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'
import { UpdateOrderPaymentStatusUseCase } from './update-order-payment-status.use-case'

@Injectable()
export class RefundPaymentUseCase {
  constructor(
    private prisma: PrismaService,
    private updateOrderPaymentStatusUseCase: UpdateOrderPaymentStatusUseCase,
  ) {}

  async execute(id: string, amount: number, organizationId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id,
        order: { organizationId }
      }
    })
    if (!payment) throw new NotFoundException('Payment not found')
    if (payment.status !== 'PAID') throw new BadRequestException('Only paid payments can be refunded')
    if (amount > payment.amount) throw new BadRequestException('Refund amount cannot exceed payment amount')

    const updated = await this.prisma.payment.update({
      where: { id },
      data: {
        status: amount < payment.amount ? 'PARTIAL' : 'REFUNDED',
        refundedAt: new Date(),
      },
      include: { order: true },
    })

    await this.updateOrderPaymentStatusUseCase.execute(updated.orderId)

    return updated
  }
}
