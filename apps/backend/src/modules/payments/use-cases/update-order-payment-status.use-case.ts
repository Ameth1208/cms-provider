import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class UpdateOrderPaymentStatusUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(orderId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { orderId }
    })

    const totalPaid = payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0)

    const totalRefunded = payments
      .filter(p => ['REFUNDED', 'PARTIAL'].includes(p.status))
      .reduce((sum, p) => sum + p.amount, 0)

    let paymentStatus = 'PENDING'
    if (totalRefunded > 0 && totalRefunded >= totalPaid) {
      paymentStatus = 'REFUNDED'
    } else if (totalRefunded > 0) {
      paymentStatus = 'PARTIAL'
    } else if (totalPaid > 0) {
      paymentStatus = 'PAID'
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: paymentStatus as any }
    })
  }
}
