import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

interface UpdateSlideData {
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
}

@Injectable()
export class UpdateSlideUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, data: UpdateSlideData, organizationId: string) {
    const slide = await this.prisma.homepageSlide.findFirst({
      where: { id, section: { organizationId } },
    })
    if (!slide) throw new NotFoundException('Slide not found')

    return this.prisma.homepageSlide.update({ where: { id }, data })
  }
}
