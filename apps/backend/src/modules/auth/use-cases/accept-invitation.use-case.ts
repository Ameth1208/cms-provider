import { Injectable, BadRequestException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class AcceptInvitationUseCase {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async execute(token: string, data: { name: string; password: string }) {
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
        include: { organization: { select: { slug: true } } },
      })

      if (!invitation) {
        throw new BadRequestException('Invalid or expired invitation')
      }

      // Check if user already exists in this org
      const existingUser = await this.prisma.user.findUnique({
        where: {
          email_organizationId: {
            email: invitation.email,
            organizationId: invitation.organizationId,
          },
        },
      })

      if (existingUser) {
        throw new ConflictException('User already exists in this organization')
      }

      const hashed = await bcrypt.hash(data.password, 12)

      const user = await this.prisma.user.create({
        data: {
          email: invitation.email,
          password: hashed,
          name: data.name || invitation.name,
          organizationId: invitation.organizationId,
          modulesEnabled: invitation.modulesEnabled,
          invitedBy: invitation.invitedBy,
        },
      })

      // Assign roles
      if (invitation.roleIds.length > 0) {
        await this.prisma.userRole.createMany({
          data: invitation.roleIds.map((roleId) => ({
            userId: user.id,
            roleId,
          })),
          skipDuplicates: true,
        })
      }

      // Mark invitation as used
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { usedAt: new Date() },
      })

      return { user, organizationSlug: invitation.organization.slug }
    } catch (err) {
      if (err instanceof BadRequestException || err instanceof ConflictException) {
        throw err
      }
      throw new BadRequestException('Invalid or expired invitation')
    }
  }
}
