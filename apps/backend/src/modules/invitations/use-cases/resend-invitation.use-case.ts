import { Injectable, NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@common/prisma.service'
import { MailService } from '../../../common/mail.service'

@Injectable()
export class ResendInvitationUseCase {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  async execute(id: string, organizationId: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id, organizationId, usedAt: null },
      include: { organization: { select: { name: true, slug: true } } },
    })

    if (!invitation) {
      throw new NotFoundException('Invitation not found or already used')
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Generate new token
    const token = this.jwt.sign(
      {
        invitationId: invitation.id,
        email: invitation.email,
        organizationId: invitation.organizationId,
      },
      {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: '7d',
      },
    )

    const updated = await this.prisma.invitation.update({
      where: { id },
      data: { token, expiresAt },
      include: { organization: { select: { name: true } } },
    })

    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3003')
    const invitationUrl = `${frontendUrl}/accept-invitation?token=${token}`

    await this.mail.sendInvitation({
      to: updated.email,
      organizationName: updated.organization.name,
      invitationUrl,
    })

    return {
      ...updated,
      token,
      invitationUrl,
    }
  }
}
