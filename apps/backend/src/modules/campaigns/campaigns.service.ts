import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.campaign.findMany({
      where: { organizationId },
      include: {
        discounts: true,
      },
      orderBy: { startDate: 'desc' },
    })
  }

  async findOne(id: string, organizationId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, organizationId },
      include: { discounts: true },
    })
    if (!campaign) throw new NotFoundException('Campaign not found')
    return campaign
  }

  async create(data: {
    name: string
    description?: string
    startDate: string
    endDate: string
    autoApply: boolean
    discounts: { type: 'PERCENTAGE' | 'FIXED'; value: number; code?: string; maxUses?: number }[]
  }, organizationId: string) {
    return this.prisma.campaign.create({
      data: {
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        autoApply: data.autoApply,
        active: true,
        organizationId,
        discounts: {
          create: data.discounts.map((d) => ({
            type: d.type,
            value: d.value,
            code: d.code,
            maxUses: d.maxUses,
            usedCount: 0,
          })),
        },
      },
      include: { discounts: true },
    })
  }

  async update(id: string, data: {
    name?: string
    description?: string
    startDate?: string
    endDate?: string
    active?: boolean
    autoApply?: boolean
  }, organizationId: string) {
    const campaign = await this.prisma.campaign.findFirst({ where: { id, organizationId } })
    if (!campaign) throw new NotFoundException('Campaign not found')

    return this.prisma.campaign.update({
      where: { id },
      data: {
        ...data,
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
      },
      include: { discounts: true },
    })
  }

  async toggleActive(id: string, organizationId: string) {
    const campaign = await this.prisma.campaign.findFirst({ where: { id, organizationId } })
    if (!campaign) throw new NotFoundException('Campaign not found')

    return this.prisma.campaign.update({
      where: { id },
      data: { active: !campaign.active },
      include: { discounts: true },
    })
  }

  async delete(id: string, organizationId: string) {
    const campaign = await this.prisma.campaign.findFirst({ where: { id, organizationId } })
    if (!campaign) throw new NotFoundException('Campaign not found')

    await this.prisma.discount.deleteMany({ where: { campaignId: id } })
    await this.prisma.campaign.delete({ where: { id } })
  }

  async autoDeactivateExpired() {
    const expired = await this.prisma.campaign.updateMany({
      where: {
        active: true,
        endDate: { lte: new Date() },
      },
      data: { active: false },
    })
    return { deactivated: expired.count }
  }
}
