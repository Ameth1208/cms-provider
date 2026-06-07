import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma.service'

@Injectable()
export class UpdateClientStatusUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, status: string) {
    return this.prisma.organization.update({
      where: { id },
      data: { status },
    })
  }
}
