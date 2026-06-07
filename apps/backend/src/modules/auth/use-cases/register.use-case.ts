import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class RegisterUseCase {
  constructor(private prisma: PrismaService) {}

  async execute(data: { email: string; password: string; name?: string; organizationName: string }) {
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
      'drivers', 'returns', 'locations', 'deliveries',
      'delivery_routes', 'delivery_zones', 'shipping',
      'invitations', 'admin',
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

    return { user, organization: org }
  }
}
