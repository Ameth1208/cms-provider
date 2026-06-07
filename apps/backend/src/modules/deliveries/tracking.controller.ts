import { Controller, Get, Param } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { PrismaService } from '@common/prisma.service'

@ApiTags('Public Tracking')
@Controller('tracking')
export class TrackingController {
  constructor(private prisma: PrismaService) {}

  @Get(':orderId')
  async trackOrder(@Param('orderId') orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        customerName: true,
        shippingAddress: true,
        shippingCity: true,
        total: true,
        createdAt: true,
        deliveredAt: true,
        driver: {
          select: {
            name: true,
            phone: true,
            currentLat: true,
            currentLng: true,
            lastLocationAt: true,
          },
        },
        delivery: {
          include: {
            trackingEvents: {
              orderBy: { timestamp: 'desc' },
            },
          },
        },
      },
    })

    if (!order) {
      return { error: 'Order not found' }
    }

    return {
      orderId: order.id,
      status: order.status,
      customerName: order.customerName,
      address: `${order.shippingAddress}${order.shippingCity ? `, ${order.shippingCity}` : ''}`,
      total: order.total,
      createdAt: order.createdAt,
      deliveredAt: order.deliveredAt,
      driver: order.driver,
      trackingEvents: order.delivery?.trackingEvents || [],
    }
  }
}
