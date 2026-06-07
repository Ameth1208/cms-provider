import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

interface AddProductToSectionData {
  sectionId: string
  catalogItemId: string
  order?: number
}

@Injectable()
export class AddProductToSectionUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(data: AddProductToSectionData, organizationId: string) {
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
}
