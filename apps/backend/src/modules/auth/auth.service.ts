import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../../common/prisma.service'
import { LoginRequest, LoginResponse, JwtPayload, MultiOrgLoginResponse } from '@cms/shared'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  private async buildLoginResponse(user: any): Promise<LoginResponse> {
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

  async login(data: LoginRequest): Promise<LoginResponse | MultiOrgLoginResponse> {
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

  async register(data: { email: string; password: string; name?: string; organizationName: string }) {
    // Note: with multi-tenant email uniqueness, registration creates a new org
    // so we don't need to check global email uniqueness anymore

    const hashed = await bcrypt.hash(data.password, 12)

    const org = await this.prisma.organization.create({
      data: {
        name: data.organizationName,
        slug: data.organizationName.toLowerCase().replace(/\s+/g, '-'),
      },
    })

    const resources = [
      'catalog', 'orders', 'inventory', 'campaigns',
      'users', 'roles', 'settings', 'media', 'api_keys',
      'content', 'batches', 'reviews', 'customers', 'payments',
      'drivers', 'returns',
    ]
    const actions = ['create', 'read', 'update', 'delete', 'manage']

    // Upsert all permissions
    const permissionIds: string[] = []
    for (const resource of resources) {
      for (const action of actions) {
        const permission = await this.prisma.permission.upsert({
          where: { resource_action: { resource, action } },
          create: { resource, action, name: `${action} ${resource}` },
          update: {},
        })
        permissionIds.push(permission.id)
      }
    }

    // Create OWNER role with all permissions
    const ownerRole = await this.prisma.role.create({
      data: {
        name: 'OWNER',
        description: 'Dueño del negocio. Control total.',
        organizationId: org.id,
      },
    })

    await this.prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({ roleId: ownerRole.id, permissionId })),
      skipDuplicates: true,
    })

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        name: data.name,
        organizationId: org.id,
      },
    })

    await this.prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: ownerRole.id,
      },
    })

    return this.login({ email: data.email, password: data.password, organizationSlug: org.slug })
  }

  async acceptInvitation(token: string, data: { name: string; password: string }) {
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

      return this.login({
        email: user.email,
        password: data.password,
        organizationSlug: invitation.organization.slug,
      })
    } catch (err) {
      if (err instanceof BadRequestException || err instanceof ConflictException) {
        throw err
      }
      throw new BadRequestException('Invalid or expired invitation')
    }
  }

  async validateInvitationToken(token: string) {
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

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: { select: { id: true, name: true, modulesEnabled: true } },
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    })

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    const permissions = user.roles.flatMap((ur) =>
      ur.role.permissions.map((rp) => ({
        resource: rp.permission.resource,
        action: rp.permission.action,
      })),
    )

    const roles = user.roles.map((ur) => ur.role.name)

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      organizationId: user.organizationId,
      organizationName: user.organization.name,
      permissions,
      roles,
      modulesEnabled: user.modulesEnabled?.length > 0 ? user.modulesEnabled : user.organization.modulesEnabled,
    }
  }

  async refresh(token: string): Promise<{ accessToken: string }> {
    try {
      const decoded = this.jwt.verify(token, {
        secret: this.config.get('JWT_SECRET'),
      }) as JwtPayload

      const newPayload: JwtPayload = {
        sub: decoded.sub,
        email: decoded.email,
        organizationId: decoded.organizationId,
        permissions: decoded.permissions,
        roles: decoded.roles || [],
      }

      return { accessToken: this.jwt.sign(newPayload) }
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }
}
