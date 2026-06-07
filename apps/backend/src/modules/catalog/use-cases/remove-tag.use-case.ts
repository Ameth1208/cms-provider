import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class RemoveTagUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, organizationId: string): Promise<void> {
    const tag = await this.prisma.tag.findFirst({ where: { id, organizationId } })
    if (!tag) throw new NotFoundException('Tag not found')
    await this.prisma.catalogItemTag.deleteMany({ where: { tagId: id } })
    await this.prisma.tag.delete({ where: { id } })
  }
}
