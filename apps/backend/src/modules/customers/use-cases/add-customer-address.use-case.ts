import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

interface AddAddressData {
  label: string
  street: string
  city: string
  state?: string
  zip?: string
  country?: string
  isDefault?: boolean
}

@Injectable()
export class AddCustomerAddressUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(customerId: string, data: AddAddressData, organizationId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, organizationId }
    })
    if (!customer) throw new NotFoundException('Customer not found')

    if (data.isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId },
        data: { isDefault: false }
      })
    }

    return this.prisma.customerAddress.create({
      data: { ...data, customerId }
    })
  }
}
