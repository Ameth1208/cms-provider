import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../common/prisma.service'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class CreateClientUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(data: {
    organizationName: string
    adminEmail: string
    adminName?: string
    adminPassword?: string
    modulesEnabled?: string[]
    plan?: string
  }) {
    const org = await this.prisma.organization.create({
      data: {
        name: data.organizationName,
        slug: data.organizationName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        modulesEnabled: data.modulesEnabled || ['catalog', 'orders'],
      },
    })

    const adminRole = await this.prisma.role.create({
      data: {
        name: 'ADMIN',
        description: 'Administrador del negocio. Gestiona usuarios y configuración.',
        organizationId: org.id,
      },
    })

    const managerRole = await this.prisma.role.create({
      data: {
        name: 'MANAGER',
        description: 'Gerente. Acceso a la mayoría de módulos.',
        organizationId: org.id,
      },
    })

    const editorRole = await this.prisma.role.create({
      data: {
        name: 'EDITOR',
        description: 'Editor. Solo puede editar contenido.',
        organizationId: org.id,
      },
    })

    const viewerRole = await this.prisma.role.create({
      data: {
        name: 'VIEWER',
        description: 'Solo lectura. Puede ver reportes y catálogos.',
        organizationId: org.id,
      },
    })

    const allPermissions = await this.prisma.permission.findMany()

    await this.prisma.rolePermission.createMany({
      data: allPermissions.map((p: { id: string }) => ({
        roleId: adminRole.id,
        permissionId: p.id,
      })),
      skipDuplicates: true,
    })

    const managerPermissions = allPermissions.filter(
      (p: { resource: string }) => p.resource === 'catalog' || p.resource === 'orders' || p.resource === 'inventory' || p.resource === 'campaigns',
    )
    await this.prisma.rolePermission.createMany({
      data: managerPermissions.map((p: { id: string }) => ({
        roleId: managerRole.id,
        permissionId: p.id,
      })),
      skipDuplicates: true,
    })

    const viewerPermissions = allPermissions.filter((p: { action: string }) => p.action === 'read')
    await this.prisma.rolePermission.createMany({
      data: viewerPermissions.map((p: { id: string }) => ({
        roleId: viewerRole.id,
        permissionId: p.id,
      })),
      skipDuplicates: true,
    })

    const password = data.adminPassword || Math.random().toString(36).slice(2, 14) + Math.random().toString(36).slice(2, 14)
    const hashed = await bcrypt.hash(password, 12)

    const user = await this.prisma.user.create({
      data: {
        email: data.adminEmail,
        password: hashed,
        name: data.adminName,
        organizationId: org.id,
        modulesEnabled: data.modulesEnabled || ['catalog', 'orders'],
      },
    })

    await this.prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: adminRole.id,
      },
    })

    return {
      organization: org,
      admin: {
        id: user.id,
        email: user.email,
        name: user.name,
        temporaryPassword: data.adminPassword ? undefined : password,
      },
    }
  }
}
