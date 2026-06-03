import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'
import { OrdersGateway } from './orders.gateway'

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private gateway: OrdersGateway,
  ) {}

  async findAll(organizationId: string, query?: { status?: string }) {
    const where: any = { organizationId }
    if (query?.status) where.status = query.status

    return this.prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string, organizationId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, organizationId },
      include: { items: true },
    })
    if (!order) throw new NotFoundException('Order not found')
    return order
  }

  async create(data: {
    customerName: string
    customerEmail: string
    customerPhone?: string
    notes?: string
    items: { catalogItemId: string; quantity: number }[]
    couponCode?: string
  }, organizationId: string) {
    let discount = 0

    if (data.couponCode) {
      const campaign = await this.prisma.campaign.findFirst({
        where: {
          organizationId,
          active: true,
          autoApply: false,
          discounts: { some: { code: data.couponCode } },
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
        include: { discounts: { where: { code: data.couponCode } } },
      })

      if (campaign?.discounts[0]) {
        const discountObj = campaign.discounts[0]
        if (discountObj.maxUses && discountObj.usedCount >= discountObj.maxUses) {
          throw new BadRequestException('Coupon has reached its usage limit')
        }

        if (discountObj.type === 'PERCENTAGE') {
          discount = discountObj.value
        }
      }
    }

    const catalogItems = await this.prisma.catalogItem.findMany({
      where: {
        id: { in: data.items.map((i) => i.catalogItemId) },
        organizationId,
      },
    })

    const items = data.items.map((item) => {
      const catalog = catalogItems.find((c) => c.id === item.catalogItemId)
      if (!catalog) throw new NotFoundException(`Item ${item.catalogItemId} not found`)

      const unitPrice = catalog.price
      const totalPrice = unitPrice * item.quantity
      return {
        catalogItemId: item.catalogItemId,
        catalogItemName: catalog.name,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      }
    })

    const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0)
    const discountAmount = discount > 0 ? subtotal * (discount / 100) : 0
    const total = subtotal - discountAmount

    const order = await this.prisma.order.create({
      data: {
        status: 'PENDING',
        subtotal,
        discount: discountAmount,
        total,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        notes: data.notes,
        couponCode: data.couponCode,
        organizationId,
        items: { create: items },
      },
      include: { items: true },
    })

    if (data.couponCode) {
      await this.prisma.discount.updateMany({
        where: { code: data.couponCode, campaign: { organizationId } },
        data: { usedCount: { increment: 1 } },
      })
    }

    this.gateway.emitOrderCreated(order)
    return order
  }

  async update(id: string, data: {
    status?: string
    customerName?: string
    customerEmail?: string
    customerPhone?: string
    shippingAddress?: string
    shippingCity?: string
    shippingState?: string
    shippingZip?: string
    shippingCountry?: string
    carrier?: string
    trackingNumber?: string
    notes?: string
  }, organizationId: string) {
    const order = await this.prisma.order.findFirst({ where: { id, organizationId } })
    if (!order) throw new NotFoundException('Order not found')

    const updateData: any = { ...data }
    if (data.status === 'SHIPPED' && !order.shippedAt) {
      updateData.shippedAt = new Date()
    }
    if (data.status === 'DELIVERED' && !order.deliveredAt) {
      updateData.deliveredAt = new Date()
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: updateData,
      include: { items: true },
    })

    this.gateway.emitOrderStatus(updated)
    return updated
  }

  async updateStatus(id: string, status: string, organizationId: string) {
    return this.update(id, { status }, organizationId)
  }

  async getStats(organizationId: string) {
    const [totalOrders, pendingOrders, totalRevenue] = await Promise.all([
      this.prisma.order.count({ where: { organizationId } }),
      this.prisma.order.count({ where: { organizationId, status: 'PENDING' } }),
      this.prisma.order.aggregate({
        where: { organizationId, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
    ])

    return {
      totalOrders,
      pendingOrders,
      totalRevenue: totalRevenue._sum.total || 0,
    }
  }
}
