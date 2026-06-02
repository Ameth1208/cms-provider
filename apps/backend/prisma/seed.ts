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

const RESOURCES = ['catalog', 'orders', 'inventory', 'campaigns', 'users', 'roles', 'settings', 'media', 'api_keys'] as const
const ACTIONS = ['create', 'read', 'update', 'delete', 'manage'] as const

async function main() {
  console.log('🌱 Seeding database...')

  const org = await prisma.organization.upsert({
    where: { slug: DEFAULT_ORGANIZATION.slug },
    create: DEFAULT_ORGANIZATION,
    update: {},
  })
  console.log(`  ✓ Organization: ${org.name} (${org.id})`)

  const permissionIds: string[] = []
  for (const resource of RESOURCES) {
    for (const action of ACTIONS) {
      const permission = await prisma.permission.upsert({
        where: { resource_action: { resource, action } },
        create: { resource, action, name: `${action} ${resource}` },
        update: {},
      })
      permissionIds.push(permission.id)
    }
  }
  console.log(`  ✓ ${permissionIds.length} permissions created`)

  const role = await prisma.role.upsert({
    where: { name_organizationId: { name: 'Administrador', organizationId: org.id } },
    create: {
      name: 'Administrador',
      description: 'Acceso completo a todos los módulos',
      organizationId: org.id,
    },
    update: {},
  })

  for (const permissionId of permissionIds) {
    await prisma.rolePermission
      .create({ data: { roleId: role.id, permissionId } })
      .catch(() => {})
  }
  console.log(`  ✓ Role: ${role.name} with ${permissionIds.length} permissions`)

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

  await prisma.userRole
    .create({ data: { userId: user.id, roleId: role.id } })
    .catch(() => {})

  console.log(`  ✓ User: ${user.email} / ${DEFAULT_USER.password}`)
  console.log('')
  console.log('  ┌──────────────────────────────────────────────┐')
  console.log('  │  Email:    admin@admin.com                   │')
  console.log('  │  Password: admin123                          │')
  console.log('  └──────────────────────────────────────────────┘')
  console.log('')
  console.log('✅ Seed completed')
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
