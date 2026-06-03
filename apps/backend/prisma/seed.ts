import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { URL } from 'node:url'
import { hashSync } from 'bcryptjs'

function parseDatabaseUrl(urlString: string) {
  const url = new URL(urlString)
  return {
    host: url.hostname,
    port: parseInt(url.port, 10),
    database: url.pathname.slice(1),
    user: url.username,
    password: url.password,
  }
}

const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL!)
const pool = new Pool(dbConfig)
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const DEFAULT_ORGANIZATION = {
  name: 'Mi Empresa',
  slug: 'mi-empresa',
}

const DEFAULT_USER = {
  email: 'admin@admin.com',
  password: 'admin123',
  name: 'Administrador',
}

const RESOURCES = [
  'catalog',
  'orders',
  'inventory',
  'content',
  'campaigns',
  'users',
  'roles',
  'settings',
  'media',
  'api_keys',
  'content',
  'batches',
  'reviews',
] as const

const ACTIONS = ['create', 'read', 'update', 'delete', 'manage'] as const

type PermissionMap = Record<string, string>

async function main() {
  console.log('🌱 Seeding database...')

  const org = await prisma.organization.upsert({
    where: { slug: DEFAULT_ORGANIZATION.slug },
    create: DEFAULT_ORGANIZATION,
    update: {},
  })
  console.log(`  ✓ Organization: ${org.name} (${org.id})`)

  // ─── Permissions ───
  const permissionMap: PermissionMap = {}
  for (const resource of RESOURCES) {
    for (const action of ACTIONS) {
      const permission = await prisma.permission.upsert({
        where: { resource_action: { resource, action } },
        create: { resource, action, name: `${action} ${resource}` },
        update: {},
      })
      permissionMap[`${resource}.${action}`] = permission.id
    }
  }
  const totalPermissions = Object.keys(permissionMap).length
  console.log(`  ✓ ${totalPermissions} permissions created`)

  // ─── System Roles ───
  const allPermIds = Object.values(permissionMap)

  const roleDefinitions = [
    {
      name: 'OWNER',
      description: 'Dueño del negocio. Control total.',
      permissions: allPermIds,
    },
    {
      name: 'ADMIN',
      description: 'Administrador. Acceso completo excepto gestión de suscripción.',
      permissions: allPermIds.filter((id) => {
        const key = Object.entries(permissionMap).find(([, v]) => v === id)?.[0]
        return key !== 'settings.manage'
      }),
    },
    {
      name: 'MANAGER',
      description: 'Gestor de operaciones. Puede administrar catálogo, pedidos, inventario, campañas y contenido.',
      permissions: allPermIds.filter((id) => {
        const key = Object.entries(permissionMap).find(([, v]) => v === id)?.[0]
        if (!key) return false
        const [resource, action] = key.split('.')
        const excludedResources = ['users', 'roles', 'settings', 'api_keys']
        if (excludedResources.includes(resource)) {
          return action === 'read'
        }
        return true
      }),
    },
    {
      name: 'EDITOR',
      description: 'Editor de contenido. Puede crear y editar catálogo, contenido y campañas. Solo lectura en pedidos e inventario.',
      permissions: allPermIds.filter((id) => {
        const key = Object.entries(permissionMap).find(([, v]) => v === id)?.[0]
        if (!key) return false
        const [resource, action] = key.split('.')
        const editorResources = ['catalog', 'content', 'campaigns', 'media', 'reviews']
        const readOnlyResources = ['orders', 'inventory', 'batches']
        if (editorResources.includes(resource)) {
          return ['create', 'read', 'update'].includes(action)
        }
        if (readOnlyResources.includes(resource)) {
          return action === 'read'
        }
        return false
      }),
    },
    {
      name: 'VIEWER',
      description: 'Solo lectura. Puede ver reportes y catálogos pero no modificarlos.',
      permissions: allPermIds.filter((id) => {
        const key = Object.entries(permissionMap).find(([, v]) => v === id)?.[0]
        return key?.endsWith('.read')
      }),
    },
  ]

  for (const def of roleDefinitions) {
    const role = await prisma.role.upsert({
      where: { name_organizationId: { name: def.name, organizationId: org.id } },
      create: {
        name: def.name,
        description: def.description,
        organizationId: org.id,
      },
      update: {
        description: def.description,
      },
    })

    // Clear existing permissions and re-assign
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } })
    await prisma.rolePermission.createMany({
      data: def.permissions.map((permissionId) => ({ roleId: role.id, permissionId })),
      skipDuplicates: true,
    })

    console.log(`  ✓ Role: ${role.name} with ${def.permissions.length} permissions`)
  }

  // ─── Default Owner User ───
  const hashedPassword = hashSync(DEFAULT_USER.password, 12)

  const user = await prisma.user.upsert({
    where: { email: DEFAULT_USER.email },
    create: {
      email: DEFAULT_USER.email,
      password: hashedPassword,
      name: DEFAULT_USER.name,
      organizationId: org.id,
    },
    update: {},
  })

  const ownerRole = await prisma.role.findUnique({
    where: { name_organizationId: { name: 'OWNER', organizationId: org.id } },
  })

  if (ownerRole) {
    await prisma.userRole
      .upsert({
        where: { userId_roleId: { userId: user.id, roleId: ownerRole.id } },
        create: { userId: user.id, roleId: ownerRole.id },
        update: {},
      })
      .catch(() => {})
  }

  console.log(`  ✓ User: ${user.email} / ${DEFAULT_USER.password} (OWNER)`)
  console.log('')
  console.log('  ┌──────────────────────────────────────────────┐')
  console.log('  │  Email:    admin@admin.com                   │')
  console.log('  │  Password: admin123                          │')
  console.log('  │  Role:     OWNER                             │')
  console.log('  └──────────────────────────────────────────────┘')
  console.log('')
  console.log('✅ Seed completed')
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
