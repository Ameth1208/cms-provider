import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'
import { OrdersGateway } from '../orders.gateway'

interface CreateOrderData {
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
}

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private prisma: PrismaService,
    private gateway: OrdersGateway,
  ) {}

  async execute(data: CreateOrderData, organizationId: string) {
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
}
