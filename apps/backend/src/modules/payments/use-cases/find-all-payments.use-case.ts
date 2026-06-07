import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

interface QueryParams {
  status?: string
  method?: string
}

@Injectable()
export class FindAllPaymentsUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(organizationId: string, query?: QueryParams) {
    const where: any = {
      order: { organizationId }
    }
    if (query?.status) where.status = query.status
    if (query?.method) where.method = query.method

    const payments = await this.prisma.payment.findMany({
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

    return payments
  }
}
