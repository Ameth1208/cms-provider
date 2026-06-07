import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

interface QueryParams {
  search?: string
}

@Injectable()
export class FindAllCustomersUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(organizationId: string, query?: QueryParams) {
    const where: any = { organizationId }

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { document: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    return this.prisma.customer.findMany({
      where,
      include: {
        addresses: true,
        _count: { select: { orders: true } }
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
