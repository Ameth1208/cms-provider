import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string, query?: { search?: string }) {
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

  async findOne(id: string, organizationId: string) {
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

  async create(data: {
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
  }, organizationId: string) {
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

  async update(id: string, data: {
    name?: string
    email?: string
    phone?: string
    document?: string
    documentType?: string
    notes?: string
    active?: boolean
  }, organizationId: string) {
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

  async remove(id: string, organizationId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, organizationId }
    })
    if (!customer) throw new NotFoundException('Customer not found')

    await this.prisma.customer.delete({ where: { id } })
    return { success: true }
  }

  async addAddress(customerId: string, data: {
    label: string
    street: string
    city: string
    state?: string
    zip?: string
    country?: string
    isDefault?: boolean
  }, organizationId: string) {
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

  async removeAddress(customerId: string, addressId: string, organizationId: string) {
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
