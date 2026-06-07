import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class GetPaymentStatsUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(organizationId: string) {
    const [totalPayments, totalPaid, totalRefunded, totalPending] = await Promise.all([
      this.prisma.payment.count({
        where: { order: { organizationId } }
      }),
      this.prisma.payment.aggregate({
        where: { order: { organizationId }, status: 'PAID' },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { order: { organizationId }, status: { in: ['REFUNDED', 'PARTIAL'] } },
        _sum: { amount: true },
      }),
      this.prisma.payment.count({
        where: { order: { organizationId }, status: 'PENDING' }
      }),
    ])

    return {
      totalPayments,
      totalPaid: totalPaid._sum.amount || 0,
      totalRefunded: totalRefunded._sum.amount || 0,
      totalPending,
    }
  }
}
