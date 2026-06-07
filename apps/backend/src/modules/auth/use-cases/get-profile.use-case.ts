import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class GetProfileUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(userId: string) {
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
}
