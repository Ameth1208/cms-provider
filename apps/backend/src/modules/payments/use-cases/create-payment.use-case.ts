import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

interface CreatePaymentData {
  orderId: string
  method: string
  amount: number
  currency?: string
  reference?: string
  externalId?: string
}

@Injectable()
export class CreatePaymentUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(data: CreatePaymentData, organizationId: string) {
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
}
