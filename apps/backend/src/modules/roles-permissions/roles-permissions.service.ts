import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'

@Injectable()
export class RolesPermissionsService {
  constructor(private prisma: PrismaService) {}

  async findAllPermissions() {
    return this.prisma.permission.findMany({ orderBy: [{ resource: 'asc' }, { action: 'asc' }] })
  }

  async findAllRoles(organizationId: string) {
    return this.prisma.role.findMany({
      where: { organizationId },
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: { select: { users: true } },
      },
    })
  }

  async findOneRole(id: string, organizationId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, organizationId },
      include: { permissions: { include: { permission: true } } },
    })
    if (!role) throw new NotFoundException('Role not found')
    return role
  }

  async createRole(data: { name: string; description?: string; permissionIds: string[] }, organizationId: string) {
    const role = await this.prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        organizationId,
        permissions: {
          create: data.permissionIds.map((permissionId) => ({ permissionId })),
        },
      },
      include: { permissions: { include: { permission: true } } },
    })
    return role
  }

  async updateRole(id: string, data: { name?: string; description?: string; permissionIds?: string[] }, organizationId: string) {
    const role = await this.prisma.role.findFirst({ where: { id, organizationId } })
    if (!role) throw new NotFoundException('Role not found')

    if (data.permissionIds) {
      await this.prisma.rolePermission.deleteMany({ where: { roleId: id } })
      await this.prisma.rolePermission.createMany({
        data: data.permissionIds.map((permissionId) => ({ roleId: id, permissionId })),
      })
    }

    return this.prisma.role.update({
      where: { id },
      data: { name: data.name, description: data.description },
      include: { permissions: { include: { permission: true } } },
    })
  }

  async deleteRole(id: string, organizationId: string) {
    const role = await this.prisma.role.findFirst({ where: { id, organizationId } })
    if (!role) throw new NotFoundException('Role not found')
    await this.prisma.rolePermission.deleteMany({ where: { roleId: id } })
    await this.prisma.userRole.deleteMany({ where: { roleId: id } })
    await this.prisma.role.delete({ where: { id } })
  }
}
