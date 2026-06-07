import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'
import { UpdateOrderPaymentStatusUseCase } from './update-order-payment-status.use-case'

@Injectable()
export class UpdatePaymentStatusUseCase {
  constructor(
    private prisma: PrismaService,
    private updateOrderPaymentStatusUseCase: UpdateOrderPaymentStatusUseCase,
  ) {}

  async execute(id: string, status: string, organizationId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id,
        order: { organizationId }
      }
    })
    if (!payment) throw new NotFoundException('Payment not found')

    const updateData: any = { status: status as any }
    if (status === 'PAID') {
      updateData.paidAt = new Date()
    } else if (status === 'REFUNDED') {
      updateData.refundedAt = new Date()
    }

    const updated = await this.prisma.payment.update({
      where: { id },
      data: updateData,
      include: { order: true },
    })

    await this.updateOrderPaymentStatusUseCase.execute(updated.orderId)

    return updated
  }
}
