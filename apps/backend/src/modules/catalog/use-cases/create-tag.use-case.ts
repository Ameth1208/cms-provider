import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

interface CreateTagData {
  name: string
  slug: string
}

@Injectable()
export class CreateTagUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(data: CreateTagData, organizationId: string) {
    return this.prisma.tag.create({ data: { ...data, organizationId } })
  }
}
