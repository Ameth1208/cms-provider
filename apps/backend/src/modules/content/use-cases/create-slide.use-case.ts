import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

interface CreateSlideData {
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
}

@Injectable()
export class CreateSlideUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(data: CreateSlideData, organizationId: string) {
    const section = await this.prisma.homepageSection.findFirst({
      where: { id: data.sectionId, organizationId },
    })
    if (!section) throw new NotFoundException('Section not found')

    return this.prisma.homepageSlide.create({ data })
  }
}
