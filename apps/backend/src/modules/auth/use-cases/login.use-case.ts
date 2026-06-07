import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '@common/prisma.service'
import { LoginRequest, LoginResponse, MultiOrgLoginResponse, JwtPayload } from '@cms/shared'

@Injectable()
export class LoginUseCase {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async execute(data: LoginRequest): Promise<LoginResponse | MultiOrgLoginResponse> {
    let users: any[] = []

    if (data.organizationSlug) {
      users = await this.prisma.user.findMany({
        where: {
          email: data.email,
          organization: { slug: data.organizationSlug },
          active: true,
        },
        include: {
          organization: { select: { id: true, name: true, modulesEnabled: true, slug: true } },
          roles: {
            include: {
              role: {
                include: {
                  permissions: { include: { permission: true } },
                },
              },
            },
          },
        },
      })
    } else {
      users = await this.prisma.user.findMany({
        where: {
          email: data.email,
          active: true,
        },
        include: {
          organization: { select: { id: true, name: true, modulesEnabled: true, slug: true } },
          roles: {
            include: {
              role: {
                include: {
                  permissions: { include: { permission: true } },
                },
              },
            },
          },
        },
      })
    }

    if (users.length === 0) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // If multiple users match and no org specified, ask for org selection
    if (users.length > 1 && !data.organizationSlug) {
      return {
        requireOrganizationSelection: true,
        organizations: users.map((u) => ({
          id: u.organization.id,
          name: u.organization.name,
          slug: u.organization.slug,
        })),
      }
    }

    // Verify password against the found user(s)
    let matchedUser: typeof users[0] | null = null
    for (const user of users) {
      const valid = await bcrypt.compare(data.password, user.password)
      if (valid) {
        matchedUser = user
        break
      }
    }

    if (!matchedUser) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return this.buildLoginResponse(matchedUser)
  }

  private buildLoginResponse(user: any): LoginResponse {
    const permissions = user.roles.flatMap((ur: any) =>
      ur.role.permissions.map((rp: any) => ({
        resource: rp.permission.resource,
        action: rp.permission.action,
      })),
    )

    const roles = user.roles.map((ur: any) => ur.role.name)

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      permissions,
      roles,
    }

    return {
      accessToken: this.jwt.sign(payload),
      refreshToken: this.jwt.sign(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organizationId: user.organizationId,
        organizationName: user.organization.name,
        permissions,
        roles,
        modulesEnabled: user.modulesEnabled?.length > 0 ? user.modulesEnabled : user.organization.modulesEnabled,
      },
    }
  }
}
