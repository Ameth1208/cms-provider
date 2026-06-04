import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  // ─── Sections ───

  async findSections(organizationId: string, type?: string) {
    return this.prisma.homepageSection.findMany({
      where: { organizationId, ...(type ? { type } : {}) },
      include: {
        slides: { orderBy: { order: 'asc' } },
        spotlights: {
          orderBy: { order: 'asc' },
          include: { catalogItem: { select: { id: true, name: true, slug: true, price: true, media: { take: 1 } } } },
        },
        banners: { orderBy: { order: 'asc' } },
      },
      orderBy: { order: 'asc' },
    })
  }

  async findSection(id: string, organizationId: string) {
    const section = await this.prisma.homepageSection.findFirst({
      where: { id, organizationId },
      include: {
        slides: { orderBy: { order: 'asc' } },
        spotlights: {
          orderBy: { order: 'asc' },
          include: { catalogItem: { select: { id: true, name: true, slug: true, price: true, media: { take: 1 } } } },
        },
        banners: { orderBy: { order: 'asc' } },
      },
    })
    if (!section) throw new NotFoundException('Section not found')
    return section
  }

  async createSection(data: {
    type: string
    title?: string
    order?: number
    active?: boolean
  }, organizationId: string) {
    return this.prisma.homepageSection.create({
      data: { ...data, organizationId },
    })
  }

  async updateSection(id: string, data: {
    title?: string
    order?: number
    active?: boolean
  }, organizationId: string) {
    const section = await this.prisma.homepageSection.findFirst({
      where: { id, organizationId },
    })
    if (!section) throw new NotFoundException('Section not found')

    return this.prisma.homepageSection.update({
      where: { id },
      data,
    })
  }

  async deleteSection(id: string, organizationId: string) {
    const section = await this.prisma.homepageSection.findFirst({
      where: { id, organizationId },
    })
    if (!section) throw new NotFoundException('Section not found')

    await this.prisma.homepageSection.delete({ where: { id } })
    return { deleted: true }
  }

  // ─── Slides ───

  async createSlide(data: {
    sectionId: string
    imageUrl: string
    title?: string
    subtitle?: string
    ctaText?: string
    ctaLink?: string
    bgColor?: string
    buttonColor?: string
    buttonTextColor?: string
    textColor?: string
    order?: number
  }, organizationId: string) {
    const section = await this.prisma.homepageSection.findFirst({
      where: { id: data.sectionId, organizationId },
    })
    if (!section) throw new NotFoundException('Section not found')

    return this.prisma.homepageSlide.create({ data })
  }

  async updateSlide(id: string, data: {
    imageUrl?: string
    title?: string
    subtitle?: string
    ctaText?: string
    ctaLink?: string
    bgColor?: string
    buttonColor?: string
    buttonTextColor?: string
    textColor?: string
    order?: number
    active?: boolean
  }, organizationId: string) {
    const slide = await this.prisma.homepageSlide.findFirst({
      where: { id, section: { organizationId } },
    })
    if (!slide) throw new NotFoundException('Slide not found')

    return this.prisma.homepageSlide.update({ where: { id }, data })
  }

  async deleteSlide(id: string, organizationId: string) {
    const slide = await this.prisma.homepageSlide.findFirst({
      where: { id, section: { organizationId } },
    })
    if (!slide) throw new NotFoundException('Slide not found')

    await this.prisma.homepageSlide.delete({ where: { id } })
    return { deleted: true }
  }

  // ─── Product Spotlights ───

  async addProductToSection(data: {
    sectionId: string
    catalogItemId: string
    order?: number
  }, organizationId: string) {
    const section = await this.prisma.homepageSection.findFirst({
      where: { id: data.sectionId, organizationId },
    })
    if (!section) throw new NotFoundException('Section not found')

    const item = await this.prisma.catalogItem.findFirst({
      where: { id: data.catalogItemId, organizationId },
    })
    if (!item) throw new NotFoundException('Catalog item not found')

    return this.prisma.homepageProductSpotlight.create({
      data: {
        sectionId: data.sectionId,
        catalogItemId: data.catalogItemId,
        order: data.order ?? 0,
      },
    })
  }

  async removeProductFromSection(id: string, organizationId: string) {
    const spotlight = await this.prisma.homepageProductSpotlight.findFirst({
      where: { id, section: { organizationId } },
    })
    if (!spotlight) throw new NotFoundException('Spotlight not found')

    await this.prisma.homepageProductSpotlight.delete({ where: { id } })
    return { deleted: true }
  }

  async reorderSpotlights(sectionId: string, orders: { id: string; order: number }[], organizationId: string) {
    const section = await this.prisma.homepageSection.findFirst({
      where: { id: sectionId, organizationId },
    })
    if (!section) throw new NotFoundException('Section not found')

    await this.prisma.$transaction(
      orders.map((o) =>
        this.prisma.homepageProductSpotlight.update({
          where: { id: o.id },
          data: { order: o.order },
        }),
      ),
    )

    return this.prisma.homepageProductSpotlight.findMany({
      where: { sectionId },
      orderBy: { order: 'asc' },
    })
  }

  // ─── Banners ───

  async findBanners(organizationId: string, position?: string) {
    return this.prisma.homepageBanner.findMany({
      where: { organizationId, ...(position ? { position } : {}) },
      orderBy: { order: 'asc' },
    })
  }

  async createBanner(data: {
    sectionId?: string
    imageUrl?: string
    title?: string
    description?: string
    link?: string
    position?: string
    order?: number
  }, organizationId: string) {
    return this.prisma.homepageBanner.create({
      data: { ...data, organizationId },
    })
  }

  async updateBanner(id: string, data: {
    sectionId?: string | null
    imageUrl?: string
    title?: string
    description?: string
    link?: string
    position?: string
    order?: number
    active?: boolean
  }, organizationId: string) {
    const banner = await this.prisma.homepageBanner.findFirst({
      where: { id, organizationId },
    })
    if (!banner) throw new NotFoundException('Banner not found')

    return this.prisma.homepageBanner.update({ where: { id }, data })
  }

  async deleteBanner(id: string, organizationId: string) {
    const banner = await this.prisma.homepageBanner.findFirst({
      where: { id, organizationId },
    })
    if (!banner) throw new NotFoundException('Banner not found')

    await this.prisma.homepageBanner.delete({ where: { id } })
    return { deleted: true }
  }

  // ─── Public API (for storefront) ───

  async getPublicContent(organizationId: string) {
    return this.prisma.homepageSection.findMany({
      where: { organizationId, active: true },
      include: {
        slides: {
          where: { active: true },
          orderBy: { order: 'asc' },
        },
        spotlights: {
          orderBy: { order: 'asc' },
          include: {
            catalogItem: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                comparePrice: true,
                discountType: true,
                discountValue: true,
                media: { take: 1 },
              },
            },
          },
        },
        banners: {
          where: { active: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    })
  }
}
