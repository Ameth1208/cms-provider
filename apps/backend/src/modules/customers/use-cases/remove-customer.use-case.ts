import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class RemoveCustomerUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, organizationId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, organizationId }
    })
    if (!customer) throw new NotFoundException('Customer not found')

    await this.prisma.customer.delete({ where: { id } })
    return { success: true }
  }
}
