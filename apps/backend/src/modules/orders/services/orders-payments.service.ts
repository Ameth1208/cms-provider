import { Injectable, NotFoundException } from '@nestjs/common'
import { PaymentMethod } from '@prisma/client'
import { PrismaService } from '@common/prisma.service'
import { OrdersGateway } from '../orders.gateway'

@Injectable()
export class OrdersPaymentsService {
  constructor(
    private prisma: PrismaService,
    private gateway: OrdersGateway,
  ) {}

  async addPayment(
    id: string, 
    data: { method: string; amount: number; reference?: string }, 
    organizationId: string
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id, organizationId },
      include: { payments: true }
    })
    if (!order) throw new NotFoundException('Order not found')

    // Create payment
    const payment = await this.prisma.payment.create({
      data: {
        orderId: id,
        method: this.mapPaymentMethod(data.method),
        amount: data.amount,
        status: 'PAID',
        reference: data.reference,
        paidAt: new Date(),
      }
    })

    // Calculate totals
    const allPayments = await this.prisma.payment.findMany({ where: { orderId: id } })
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0)
    const overpaidAmount = totalPaid > order.total ? totalPaid - order.total : 0

    // Update order payment status
    let paymentStatus = order.paymentStatus
    if (totalPaid >= order.total) {
      paymentStatus = 'PAID'
    } else if (totalPaid > 0) {
      paymentStatus = 'PARTIAL'
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { 
        paymentStatus,
        overpaidAmount,
      },
      include: { 
        items: true,
        payments: true,
        shippingMethod: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
      }
    })

    this.gateway.emitOrderStatus(updated)
    return updated
  }

  private mapPaymentMethod(method: string): PaymentMethod {
    const map: Record<string, PaymentMethod> = {
      'Efectivo': PaymentMethod.CASH,
      'Transferencia': PaymentMethod.BANK_TRANSFER,
      'Tarjeta de crédito': PaymentMethod.CREDIT_CARD,
      'Tarjeta de débito': PaymentMethod.DEBIT_CARD,
      'Mercado Pago': PaymentMethod.MERCADOPAGO,
      'Otro': PaymentMethod.OTHER,
    }
    return map[method] || PaymentMethod.OTHER
  }
}
