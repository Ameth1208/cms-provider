import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'

@Injectable()
export class ShippingService {
  constructor(private prisma: PrismaService) {}

  async findAllMethods(organizationId: string) {
    return this.prisma.shippingMethod.findMany({
      where: { organizationId },
      orderBy: { price: 'asc' },
    })
  }

  async createMethod(data: {
    name: string
    description?: string
    price: number
    estimatedDays?: number
  }, organizationId: string) {
    return this.prisma.shippingMethod.create({
      data: {
        ...data,
        organizationId,
      },
    })
  }

  async updateMethod(id: string, data: {
    name?: string
    description?: string
    price?: number
    estimatedDays?: number
    active?: boolean
  }, organizationId: string) {
    const method = await this.prisma.shippingMethod.findFirst({
      where: { id, organizationId }
    })
    if (!method) throw new NotFoundException('Shipping method not found')

    return this.prisma.shippingMethod.update({
      where: { id },
      data,
    })
  }

  async removeMethod(id: string, organizationId: string) {
    const method = await this.prisma.shippingMethod.findFirst({
      where: { id, organizationId }
    })
    if (!method) throw new NotFoundException('Shipping method not found')

    await this.prisma.shippingMethod.delete({ where: { id } })
    return { success: true }
  }
}
