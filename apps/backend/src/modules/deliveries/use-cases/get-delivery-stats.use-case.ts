import { Injectable } from '@nestjs/common'
import { DeliveryStatus } from '@prisma/client'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class GetDeliveryStatsUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(organizationId: string) {
    const [
      total,
      assigned,
      inProgress,
      completed,
      failed,
      avgDeliveryTime,
    ] = await Promise.all([
      this.prisma.delivery.count({
        where: { order: { organizationId } },
      }),
      this.prisma.delivery.count({
        where: { order: { organizationId }, status: DeliveryStatus.ASSIGNED },
      }),
      this.prisma.delivery.count({
        where: { order: { organizationId }, status: DeliveryStatus.IN_PROGRESS },
      }),
      this.prisma.delivery.count({
        where: { order: { organizationId }, status: DeliveryStatus.COMPLETED },
      }),
      this.prisma.delivery.count({
        where: { order: { organizationId }, status: DeliveryStatus.FAILED },
      }),
      this.prisma.delivery.findMany({
        where: {
          order: { organizationId },
          status: DeliveryStatus.COMPLETED,
          startedAt: { not: null },
          completedAt: { not: null },
        },
        select: {
          startedAt: true,
          completedAt: true,
        },
      }),
    ])

    let avgTimeMinutes = 0
    if (avgDeliveryTime.length > 0) {
      const totalMinutes = avgDeliveryTime.reduce((sum, d) => {
        if (d.startedAt && d.completedAt) {
          return sum + (d.completedAt.getTime() - d.startedAt.getTime()) / (1000 * 60)
        }
        return sum
      }, 0)
      avgTimeMinutes = Math.round(totalMinutes / avgDeliveryTime.length)
    }

    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      total,
      assigned,
      inProgress,
      completed,
      failed,
      successRate,
      avgTimeMinutes,
    }
  }
}
