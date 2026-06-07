import { Injectable, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class ValidateInvitationUseCase {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async execute(token: string) {
    try {
      const decoded = this.jwt.verify(token, {
        secret: this.config.get('JWT_SECRET'),
      }) as { invitationId: string; email: string; organizationId: string }

      const invitation = await this.prisma.invitation.findFirst({
        where: {
          id: decoded.invitationId,
          token,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        include: {
          organization: { select: { id: true, name: true, slug: true } },
        },
      })

      if (!invitation) {
        throw new BadRequestException('Invalid or expired invitation')
      }

      return {
        email: invitation.email,
        organizationName: invitation.organization.name,
        organizationSlug: invitation.organization.slug,
      }
    } catch {
      throw new BadRequestException('Invalid or expired invitation')
    }
  }
}
