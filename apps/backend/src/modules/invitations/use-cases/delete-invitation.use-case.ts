import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class DeleteInvitationUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(id: string, organizationId: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id, organizationId },
    })
    if (!invitation) throw new NotFoundException('Invitation not found')
    await this.prisma.invitation.delete({ where: { id } })
    return { deleted: true }
  }
}
