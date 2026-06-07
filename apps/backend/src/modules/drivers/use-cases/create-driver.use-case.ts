import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'
import { CreateDriverDto } from '../dto/create-driver.dto'

@Injectable()
export class CreateDriverUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(dto: CreateDriverDto, organizationId: string) {
    if (dto.userId) {
      const existing = await this.prisma.driver.findUnique({
        where: { userId: dto.userId },
      })
      if (existing) throw new BadRequestException('User already assigned to a driver')
    }

    return this.prisma.driver.create({
      data: { ...dto, organizationId },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    })
  }
}
