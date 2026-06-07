import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import { URL } from 'node:url'
import { config } from 'dotenv'
import path from 'node:path'

config({ path: path.resolve(__dirname, '../../../.env') })

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

async function main() {
  console.log('🌱 Seeding minimal data...')

  // Check if demo org already exists
  const existing = await prisma.organization.findFirst({ where: { slug: 'demo-store' } })
  if (existing) {
    console.log('✓ Organization already exists, skipping minimal seed')
    return
  }

  // Create organization
  const org = await prisma.organization.create({
    data: {
      name: 'CMS Cloud',
      slug: 'cms-cloud',
    },
  })
  console.log('✓ Organization created')

  // Create owner user
  const hashedPassword = await bcrypt.hash('Admin123!', 12)
  const owner = await prisma.user.create({
    data: {
      email: 'admin@cms.cloud',
      password: hashedPassword,
      name: 'Admin',
      organizationId: org.id,
    },
  })
  console.log('✓ Owner user created')

  // Create all permissions
  const resources = [
    'catalog', 'orders', 'inventory', 'campaigns',
    'users', 'roles', 'settings', 'media', 'api_keys',
    'content', 'batches', 'reviews', 'customers', 'payments',
    'drivers', 'returns', 'locations', 'deliveries',
    'delivery_routes', 'delivery_zones', 'shipping',
    'invitations', 'admin',
  ]
  const actions = ['create', 'read', 'update', 'delete', 'manage']

  const permissionIds: string[] = []
  for (const resource of resources) {
    for (const action of actions) {
      const permission = await prisma.permission.upsert({
        where: { resource_action: { resource, action } },
        create: { resource, action, name: `${action} ${resource}` },
        update: {},
      })
      permissionIds.push(permission.id)
    }
  }

  // Create OWNER role
  const ownerRole = await prisma.role.create({
    data: {
      name: 'OWNER',
      description: 'Dueño del negocio. Control total.',
      organizationId: org.id,
    },
  })

  await prisma.rolePermission.createMany({
    data: permissionIds.map((permissionId) => ({ roleId: ownerRole.id, permissionId })),
    skipDuplicates: true,
  })

  await prisma.userRole.create({
    data: {
      userId: owner.id,
      roleId: ownerRole.id,
    },
  })
  console.log('✓ OWNER role with permissions created')

  console.log('\n✅ Minimal seed complete!')
  console.log('Organization:', org.name)
  console.log('Login: admin@cms.cloud / Admin123!')
  console.log('Run `pnpm db:seed:demo` to add demo data (products, orders, etc.)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
