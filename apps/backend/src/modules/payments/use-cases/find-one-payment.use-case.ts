import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class FindOnePaymentUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, organizationId: string) {
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
}
