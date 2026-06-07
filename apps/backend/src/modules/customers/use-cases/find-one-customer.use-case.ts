import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class FindOneCustomerUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, organizationId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, organizationId },
      include: {
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true,
          }
        }
      },
    })
    if (!customer) throw new NotFoundException('Customer not found')
    return customer
  }
}
