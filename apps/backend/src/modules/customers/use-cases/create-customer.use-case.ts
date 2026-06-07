import { Injectable, ConflictException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

interface CreateCustomerData {
  name: string
  email: string
  phone?: string
  document?: string
  documentType?: string
  notes?: string
  addresses?: {
    label: string
    street: string
    city: string
    state?: string
    zip?: string
    country?: string
    isDefault?: boolean
  }[]
}

@Injectable()
export class CreateCustomerUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(data: CreateCustomerData, organizationId: string) {
    const existing = await this.prisma.customer.findUnique({
      where: { email_organizationId: { email: data.email, organizationId } }
    })
    if (existing) throw new ConflictException('Customer with this email already exists')

    return this.prisma.customer.create({
      data: {
        ...data,
        organizationId,
        addresses: data.addresses ? { create: data.addresses } : undefined,
      },
      include: { addresses: true },
    })
  }
}
