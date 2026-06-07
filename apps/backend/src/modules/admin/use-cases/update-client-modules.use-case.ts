import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma.service'

@Injectable()
export class UpdateClientModulesUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, modulesEnabled: string[]) {
    return this.prisma.organization.update({
      where: { id },
      data: { modulesEnabled },
    })
  }
}
