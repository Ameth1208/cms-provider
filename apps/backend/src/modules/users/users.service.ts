import { Injectable, NotFoundException } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../../common/prisma.service'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        email: true,
        name: true,
        active: true,
        modulesEnabled: true,
        createdAt: true,
        roles: {
          include: { role: { select: { id: true, name: true } } },
        },
      },
    })
  }

  async findOne(id: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, organizationId },
      select: {
        id: true,
        email: true,
        name: true,
        active: true,
        modulesEnabled: true,
        createdAt: true,
        roles: {
          include: { role: { include: { permissions: { include: { permission: true } } } } },
        },
      },
    })
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async create(data: { email: string; password: string; name?: string; roleIds: string[]; modulesEnabled?: string[] }, organizationId: string) {
    const hashed = await bcrypt.hash(data.password, 12)
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        name: data.name,
        organizationId,
        modulesEnabled: data.modulesEnabled ?? [],
        roles: {
          create: data.roleIds.map((roleId) => ({ roleId })),
        },
      },
    })

    if (data.roleIds.length > 0) {
      await this.prisma.userRole.createMany({
        data: data.roleIds.map((roleId) => ({
          userId: user.id,
          roleId,
        })),
      })
    }

    return { id: user.id, email: user.email, name: user.name }
  }

  async update(id: string, data: { name?: string; active?: boolean; roleIds?: string[]; modulesEnabled?: string[] }, organizationId: string) {
    const user = await this.prisma.user.findFirst({ where: { id, organizationId } })
    if (!user) throw new NotFoundException('User not found')

    if (data.roleIds) {
      await this.prisma.userRole.deleteMany({ where: { userId: id } })
      await this.prisma.userRole.createMany({
        data: data.roleIds.map((roleId) => ({ userId: id, roleId })),
      })
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        active: data.active,
        modulesEnabled: data.modulesEnabled,
      },
      select: { id: true, email: true, name: true, active: true, modulesEnabled: true },
    })
  }

  async remove(id: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({ where: { id, organizationId } })
    if (!user) throw new NotFoundException('User not found')
    await this.prisma.userRole.deleteMany({ where: { userId: id } })
    await this.prisma.user.delete({ where: { id } })
  }
}
