import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class RemoveCategoryUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, organizationId: string): Promise<void> {
    const cat = await this.prisma.category.findFirst({ where: { id, organizationId } })
    if (!cat) throw new NotFoundException('Category not found')
    await this.prisma.catalogItem.updateMany({ where: { categoryId: id }, data: { categoryId: null } })
    await this.prisma.category.delete({ where: { id } })
  }
}
