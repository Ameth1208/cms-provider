import { Injectable, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@common/prisma.service'
import { MailService } from '../../../common/mail.service'
import { CreateInvitationDto } from '../dto/invitation.dto'

@Injectable()
export class CreateInvitationUseCase {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  async execute(data: CreateInvitationDto, organizationId: string, invitedBy: string) {
    // Check if user already exists in this org
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email_organizationId: {
          email: data.email,
          organizationId,
        },
      },
    })

    if (existingUser) {
      throw new ConflictException('User already exists in this organization')
    }

    // Check if there's an active pending invitation for this email
    const existingInvitation = await this.prisma.invitation.findFirst({
      where: {
        email: data.email,
        organizationId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    })

    if (existingInvitation) {
      throw new ConflictException('Pending invitation already exists for this email')
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

    const invitation = await this.prisma.invitation.create({
      data: {
        token: crypto.randomUUID(),
        email: data.email,
        name: data.name,
        organizationId,
        roleIds: data.roleIds,
        modulesEnabled: data.modulesEnabled ?? [],
        invitedBy,
        expiresAt,
      },
      include: {
        organization: { select: { name: true, slug: true } },
      },
    })

    // Generate JWT for the invitation link
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

    // Update invitation with JWT token
    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: { token },
    })

    // Build invitation URL
    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3003')
    const invitationUrl = `${frontendUrl}/accept-invitation?token=${token}`

    // Send email (or log if no provider configured)
    await this.mail.sendInvitation({
      to: invitation.email,
      organizationName: invitation.organization.name,
      invitationUrl,
    })

    return {
      ...invitation,
      token,
      invitationUrl,
    }
  }
}
