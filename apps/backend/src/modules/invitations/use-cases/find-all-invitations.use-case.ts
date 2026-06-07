import { Injectable } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class FindAllInvitationsUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(organizationId: string) {
    return this.prisma.invitation.findMany({
      where: { organizationId },
      include: {
        organization: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
