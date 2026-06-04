import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../../common/prisma.service'
import { LoginRequest, LoginResponse, JwtPayload } from '@cms/shared'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(data: LoginRequest): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
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

    if (!user || !user.active) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const valid = await bcrypt.compare(data.password, user.password)
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const permissions = user.roles.flatMap((ur) =>
      ur.role.permissions.map((rp) => ({
        resource: rp.permission.resource,
        action: rp.permission.action,
      })),
    )

    const roles = user.roles.map((ur) => ur.role.name)

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

  async register(data: { email: string; password: string; name?: string; organizationName: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      throw new ConflictException('Email already registered')
    }

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

    return this.login({ email: data.email, password: data.password })
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
