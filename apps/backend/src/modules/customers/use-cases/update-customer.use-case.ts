import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

interface UpdateCustomerData {
  name?: string
  email?: string
  phone?: string
  document?: string
  documentType?: string
  notes?: string
  active?: boolean
}

@Injectable()
export class UpdateCustomerUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, data: UpdateCustomerData, organizationId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, organizationId }
    })
    if (!customer) throw new NotFoundException('Customer not found')

    if (data.email && data.email !== customer.email) {
      const existing = await this.prisma.customer.findUnique({
        where: { email_organizationId: { email: data.email, organizationId } }
      })
      if (existing) throw new ConflictException('Customer with this email already exists')
    }

    return this.prisma.customer.update({
      where: { id },
      data,
      include: { addresses: true },
    })
  }
}
