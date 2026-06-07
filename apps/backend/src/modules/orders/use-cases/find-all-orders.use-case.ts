import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

interface QueryParams {
  status?: string
  paymentStatus?: string
  customerId?: string
  search?: string
  from?: string
  to?: string
  page?: number
  pageSize?: number
}

@Injectable()
export class FindAllOrdersUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(organizationId: string, query?: QueryParams) {
    const where: any = { organizationId }
    
    if (query?.status) where.status = query.status
    if (query?.paymentStatus) where.paymentStatus = query.paymentStatus
    if (query?.customerId) where.customerId = query.customerId
    
    if (query?.search) {
      where.OR = [
        { customerName: { contains: query.search, mode: 'insensitive' } },
        { customerEmail: { contains: query.search, mode: 'insensitive' } },
        { id: { contains: query.search, mode: 'insensitive' } },
      ]
    }
    
    if (query?.from || query?.to) {
      where.createdAt = {}
      if (query.from) where.createdAt.gte = new Date(query.from + 'T00:00:00.000Z')
      if (query.to) where.createdAt.lte = new Date(query.to + 'T23:59:59.999Z')
    }

    const page = query?.page || 1
    const pageSize = query?.pageSize || 10
    const skip = (page - 1) * pageSize

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { 
          items: true,
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            }
          },
          shippingMethod: {
            select: {
              id: true,
              name: true,
              price: true,
            }
          },
          payments: {
            select: {
              id: true,
              status: true,
              amount: true,
              method: true,
              createdAt: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.order.count({ where })
    ])

    return { orders, total }
  }
}
