import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class GetDriverStatsUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(organizationId: string) {
    const drivers = await this.prisma.driver.findMany({
      where: { organizationId },
      include: {
        deliveries: {
          where: { status: { in: ['COMPLETED', 'FAILED'] } },
          select: {
            status: true,
            startedAt: true,
            completedAt: true,
          },
        },
      },
    })

    const totalDrivers = drivers.length
    const activeDrivers = drivers.filter((d) => d.active).length

    let totalDeliveries = 0
    let totalCompleted = 0
    let totalFailed = 0
    let totalMinutes = 0

    drivers.forEach((driver) => {
      driver.deliveries.forEach((delivery) => {
        totalDeliveries++
        if (delivery.status === 'COMPLETED') {
          totalCompleted++
          if (delivery.startedAt && delivery.completedAt) {
            totalMinutes +=
              (delivery.completedAt.getTime() - delivery.startedAt.getTime()) / (1000 * 60)
          }
        } else if (delivery.status === 'FAILED') {
          totalFailed++
        }
      })
    })

    const avgDeliveryTime =
      totalCompleted > 0 ? Math.round(totalMinutes / totalCompleted) : 0
    const successRate =
      totalDeliveries > 0 ? Math.round((totalCompleted / totalDeliveries) * 100) : 0

    return {
      totalDrivers,
      activeDrivers,
      totalDeliveries,
      totalCompleted,
      totalFailed,
      avgDeliveryTime,
      successRate,
    }
  }
}
