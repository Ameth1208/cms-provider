import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string, query?: { status?: string; method?: string }) {
    const where: any = {
      order: { organizationId }
    }
    if (query?.status) where.status = query.status
    if (query?.method) where.method = query.method

    return this.prisma.payment.findMany({
      where,
      include: { 
        order: {
          select: {
            id: true,
            customerName: true,
            total: true,
            status: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string, organizationId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { 
        id,
        order: { organizationId }
      },
      include: { 
        order: {
          include: {
            items: true,
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      },
    })
    if (!payment) throw new NotFoundException('Payment not found')
    return payment
  }

  async create(data: {
    orderId: string
    method: string
    amount: number
    currency?: string
    reference?: string
    externalId?: string
  }, organizationId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: data.orderId, organizationId }
    })
    if (!order) throw new NotFoundException('Order not found')

    const payment = await this.prisma.payment.create({
      data: {
        ...data,
        method: data.method as any,
        status: 'PENDING' as any,
      },
      include: { order: true },
    })

    return payment
  }

  async updateStatus(id: string, status: string, organizationId: string) {
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

    // Update order payment status
    await this.updateOrderPaymentStatus(updated.orderId)

    return updated
  }

  async refund(id: string, amount: number, organizationId: string) {
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

    await this.updateOrderPaymentStatus(updated.orderId)

    return updated
  }

  async getStats(organizationId: string) {
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

  private async updateOrderPaymentStatus(orderId: string) {
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
