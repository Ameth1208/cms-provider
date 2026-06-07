import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

interface CreateSectionData {
  type: string
  title?: string
  order?: number
  active?: boolean
}

@Injectable()
export class CreateSectionUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(data: CreateSectionData, organizationId: string) {
    return this.prisma.homepageSection.create({
      data: { ...data, organizationId },
    })
  }
}
