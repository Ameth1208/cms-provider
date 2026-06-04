import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'
import { OrdersGateway } from './orders.gateway'

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private gateway: OrdersGateway,
  ) {}

  async findAll(organizationId: string, query?: { status?: string; paymentStatus?: string; customerId?: string }) {
    const where: any = { organizationId }
    if (query?.status) where.status = query.status
    if (query?.paymentStatus) where.paymentStatus = query.paymentStatus
    if (query?.customerId) where.customerId = query.customerId

    return this.prisma.order.findMany({
      where,
      include: { 
        items: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        shippingMethod: {
          select: {
            id: true,
            name: true,
            price: true,
          }
        },
        payments: {
          select: {
            id: true,
            status: true,
            amount: true,
            method: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string, organizationId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, organizationId },
      include: { 
        items: true,
        customer: {
          include: {
            addresses: true,
          }
        },
        shippingMethod: true,
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      },
    })
    if (!order) throw new NotFoundException('Order not found')
    return order
  }

  async create(data: {
    customerId?: string
    customerName: string
    customerEmail: string
    customerPhone?: string
    shippingAddressId?: string
    shippingMethodId?: string
    shippingAddress?: string
    shippingCity?: string
    shippingState?: string
    shippingZip?: string
    shippingCountry?: string
    notes?: string
    internalNotes?: string
    items: { catalogItemId: string; quantity: number }[]
    couponCode?: string
  }, organizationId: string) {
    let discount = 0
    let customerData: any = {}

    // If customerId provided, get customer data
    if (data.customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: data.customerId, organizationId }
      })
      if (customer) {
        customerData = {
          customerId: customer.id,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
        }
      }
    }

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
    
    // Calculate shipping cost
    let shippingCost = 0
    if (data.shippingMethodId) {
      const method = await this.prisma.shippingMethod.findFirst({
        where: { id: data.shippingMethodId, organizationId }
      })
      if (method) shippingCost = method.price
    }

    const total = subtotal - discountAmount + shippingCost

    const order = await this.prisma.order.create({
      data: {
        status: 'PENDING',
        paymentStatus: 'PENDING',
        subtotal,
        discount: discountAmount,
        shippingCost,
        total,
        ...customerData,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        shippingAddressId: data.shippingAddressId,
        shippingMethodId: data.shippingMethodId,
        shippingAddress: data.shippingAddress,
        shippingCity: data.shippingCity,
        shippingState: data.shippingState,
        shippingZip: data.shippingZip,
        shippingCountry: data.shippingCountry,
        notes: data.notes,
        internalNotes: data.internalNotes,
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
    paymentStatus?: string
    shippingStatus?: string
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
    internalNotes?: string
  }, organizationId: string) {
    const order = await this.prisma.order.findFirst({ where: { id, organizationId } })
    if (!order) throw new NotFoundException('Order not found')

    const updateData: any = { ...data }
    if (data.status === 'SHIPPED' && !order.shippedAt) {
      updateData.shippedAt = new Date()
      updateData.shippingStatus = 'SHIPPED'
    }
    if (data.status === 'DELIVERED' && !order.deliveredAt) {
      updateData.deliveredAt = new Date()
      updateData.shippingStatus = 'DELIVERED'
    }
    if (data.shippingStatus === 'IN_TRANSIT' && order.shippingStatus === 'PENDING') {
      updateData.shippedAt = new Date()
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
    const [totalOrders, pendingOrders, processingOrders, shippedOrders, deliveredOrders, totalRevenue] = await Promise.all([
      this.prisma.order.count({ where: { organizationId } }),
      this.prisma.order.count({ where: { organizationId, status: 'PENDING' } }),
      this.prisma.order.count({ where: { organizationId, status: 'PROCESSING' } }),
      this.prisma.order.count({ where: { organizationId, status: 'SHIPPED' } }),
      this.prisma.order.count({ where: { organizationId, status: 'DELIVERED' } }),
      this.prisma.order.aggregate({
        where: { organizationId, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
    ])

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      totalRevenue: totalRevenue._sum.total || 0,
    }
  }

  async addItem(id: string, data: { catalogItemId: string; quantity: number }, organizationId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, organizationId },
      include: { items: true }
    })
    if (!order) throw new NotFoundException('Order not found')

    const catalogItem = await this.prisma.catalogItem.findFirst({
      where: { id: data.catalogItemId, organizationId }
    })
    if (!catalogItem) throw new NotFoundException('Catalog item not found')

    await this.prisma.orderItem.create({
      data: {
        orderId: id,
        catalogItemId: data.catalogItemId,
        catalogItemName: catalogItem.name,
        quantity: data.quantity,
        unitPrice: catalogItem.price,
        totalPrice: catalogItem.price * data.quantity,
      }
    })

    // Recalculate totals
    const allItems = await this.prisma.orderItem.findMany({ where: { orderId: id } })
    const subtotal = allItems.reduce((sum, i) => sum + i.totalPrice, 0)
    const total = subtotal - order.discount + order.shippingCost

    const updated = await this.prisma.order.update({
      where: { id },
      data: { subtotal, total },
      include: { items: true }
    })

    this.gateway.emitOrderStatus(updated)
    return updated
  }

  async removeItem(id: string, itemId: string, organizationId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, organizationId },
      include: { items: true }
    })
    if (!order) throw new NotFoundException('Order not found')

    await this.prisma.orderItem.delete({ where: { id: itemId } })

    // Recalculate totals
    const allItems = await this.prisma.orderItem.findMany({ where: { orderId: id } })
    const subtotal = allItems.reduce((sum, i) => sum + i.totalPrice, 0)
    const total = subtotal - order.discount + order.shippingCost

    const updated = await this.prisma.order.update({
      where: { id },
      data: { subtotal, total },
      include: { items: true }
    })

    this.gateway.emitOrderStatus(updated)
    return updated
  }
}
