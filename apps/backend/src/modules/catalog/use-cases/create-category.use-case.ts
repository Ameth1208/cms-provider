import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

interface CreateCategoryData {
  name: string
  slug: string
  parentId?: string
}

@Injectable()
export class CreateCategoryUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(data: CreateCategoryData, organizationId: string) {
    return this.prisma.category.create({ data: { ...data, organizationId } })
  }
}
