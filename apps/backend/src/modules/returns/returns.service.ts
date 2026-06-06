import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'
import { ReturnStatus } from '@prisma/client'
import { CreateReturnDto, UpdateReturnDto, UpdateReturnStatusDto } from './dto/return.dto'

@Injectable()
export class ReturnsService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string, filters?: { status?: string; orderId?: string }) {
    return this.prisma.return.findMany({
      where: {
        organizationId,
        ...(filters?.status && { status: filters.status as ReturnStatus }),
        ...(filters?.orderId && { orderId: filters.orderId }),
      },
      include: {
        order: {
          select: {
            id: true,
            customerName: true,
            total: true,
            status: true,
          },
        },
        pickupDriver: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string, organizationId: string) {
    const ret = await this.prisma.return.findFirst({
      where: { id, organizationId },
      include: {
        order: {
          include: {
            items: {
              select: {
                id: true,
                catalogItemName: true,
                quantity: true,
                unitPrice: true,
              },
            },
          },
        },
        pickupDriver: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    })

    if (!ret) throw new NotFoundException('Return not found')
    return ret
  }

  async create(data: CreateReturnDto, organizationId: string) {
    return this.prisma.return.create({
      data: {
        ...data,
        organizationId,
      },
      include: {
        order: {
          select: {
            id: true,
            customerName: true,
          },
        },
      },
    })
  }

  async update(id: string, data: UpdateReturnDto, organizationId: string) {
    const ret = await this.findOne(id, organizationId)

    const updateData: any = { ...data }

    if (data.status === ReturnStatus.RECEIVED && ret.status !== ReturnStatus.RECEIVED) {
      updateData.receivedAt = new Date()
    }

    if ((data.status === ReturnStatus.REFUNDED || data.status === ReturnStatus.EXCHANGED) && 
        ret.status !== ReturnStatus.REFUNDED && ret.status !== ReturnStatus.EXCHANGED) {
      updateData.resolvedAt = new Date()
    }

    return this.prisma.return.update({
      where: { id },
      data: updateData,
      include: {
        order: {
          select: {
            id: true,
            customerName: true,
          },
        },
        pickupDriver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }

  async updateStatus(id: string, data: UpdateReturnStatusDto, organizationId: string) {
    return this.update(id, { status: data.status, resolutionNotes: data.notes }, organizationId)
  }

  async delete(id: string, organizationId: string) {
    await this.findOne(id, organizationId)
    return this.prisma.return.delete({ where: { id } })
  }

  async getStats(organizationId: string) {
    const [
      total,
      pending,
      inTransit,
      received,
      refunded,
    ] = await Promise.all([
      this.prisma.return.count({ where: { organizationId } }),
      this.prisma.return.count({ where: { organizationId, status: ReturnStatus.REQUESTED } }),
      this.prisma.return.count({ where: { organizationId, status: ReturnStatus.IN_TRANSIT } }),
      this.prisma.return.count({ where: { organizationId, status: ReturnStatus.RECEIVED } }),
      this.prisma.return.count({ where: { organizationId, status: ReturnStatus.REFUNDED } }),
    ])

    return { total, pending, inTransit, received, refunded }
  }
}
