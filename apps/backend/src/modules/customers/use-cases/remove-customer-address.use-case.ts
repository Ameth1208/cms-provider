import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class RemoveCustomerAddressUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(customerId: string, addressId: string, organizationId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, organizationId }
    })
    if (!customer) throw new NotFoundException('Customer not found')

    await this.prisma.customerAddress.delete({
      where: { id: addressId }
    })
    return { success: true }
  }
}
