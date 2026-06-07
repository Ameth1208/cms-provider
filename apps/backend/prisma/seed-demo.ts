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

const ALL_MODULES = [
  'catalog', 'inventory', 'orders', 'campaigns',
  'content', 'users', 'apiKeys', 'reviews', 'settings',
  'drivers', 'returns', 'locations', 'deliveries',
  'delivery_routes', 'delivery_zones', 'shipping',
  'payments', 'customers', 'invitations',
]

async function main() {
  console.log('🎨 Seeding Aqua Marina...')

  // Upsert permissions (global)
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
      const p = await prisma.permission.upsert({
        where: { resource_action: { resource, action } },
        create: { resource, action, name: `${action} ${resource}` },
        update: {},
      })
      permissionIds.push(p.id)
    }
  }

  // Create or get Aqua Marina org
  let org = await prisma.organization.findFirst({ where: { slug: 'aqua-marina' } })
  if (!org) {
    org = await prisma.organization.create({
      data: { name: 'Aqua Marina', slug: 'aqua-marina', modulesEnabled: ALL_MODULES },
    })
  } else {
    await prisma.organization.update({
      where: { id: org.id },
      data: { modulesEnabled: ALL_MODULES },
    })
  }
  console.log('✓ Organization Aqua Marina created / updated')

  // Create owner user if not exists
  let owner = await prisma.user.findFirst({ where: { email: 'admin@aquamarina.com', organizationId: org.id } })
  if (!owner) {
    const hashed = await bcrypt.hash('Admin123!', 12)
    owner = await prisma.user.create({
      data: { email: 'admin@aquamarina.com', password: hashed, name: 'Admin Aqua Marina', organizationId: org.id },
    })
    console.log('✓ Owner user created')
  }

  // Create ADMIN role (OWNER is only for main SaaS org)
  let adminRole = await prisma.role.findFirst({ where: { name: 'ADMIN', organizationId: org.id } })
  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: { name: 'ADMIN', description: 'Administrador del negocio.', organizationId: org.id },
    })
    await prisma.rolePermission.createMany({
      data: permissionIds.map((pid) => ({ roleId: adminRole!.id, permissionId: pid })),
      skipDuplicates: true,
    })
    await prisma.userRole.create({ data: { userId: owner.id, roleId: adminRole.id } })
    console.log('✓ ADMIN role with all permissions assigned')
  }

  // Clean existing demo data
  await prisma.payment.deleteMany({ where: { order: { organizationId: org.id } } })
  await prisma.orderItem.deleteMany({ where: { order: { organizationId: org.id } } })
  await prisma.order.deleteMany({ where: { organizationId: org.id } })
  await prisma.inventory.deleteMany({ where: { catalogItem: { organizationId: org.id } } })
  await prisma.media.deleteMany({ where: { catalogItem: { organizationId: org.id } } })
  await prisma.catalogItem.deleteMany({ where: { organizationId: org.id } })
  await prisma.tag.deleteMany({ where: { organizationId: org.id } })
  await prisma.category.deleteMany({ where: { organizationId: org.id } })
  await prisma.customer.deleteMany({ where: { organizationId: org.id } })
  console.log('✓ Cleaned existing demo data')

  // Categories
  const cats = {
    makeup: await prisma.category.create({ data: { name: 'Maquillaje', slug: 'maquillaje', organizationId: org.id } }),
    clothing: await prisma.category.create({ data: { name: 'Ropa', slug: 'ropa', organizationId: org.id } }),
    services: await prisma.category.create({ data: { name: 'Servicios', slug: 'servicios', organizationId: org.id } }),
  }

  const createItem = (data: any) => prisma.catalogItem.create({ data: { organizationId: org.id, ...data } })

  const items = await Promise.all([
    // Maquillaje
    createItem({ name: 'Base Líquida HD Premium', slug: 'base-liquida-hd', description: 'Cobertura media-alta, acabado natural, larga duración 24h', price: 129900, type: 'PRODUCT', sku: 'MK-BASE-001', categoryId: cats.makeup.id }),
    createItem({ name: 'Paleta Sombras 24 Colores', slug: 'paleta-sombras-24', description: 'Tonos mate y shimmer, alta pigmentación, cruelty free', price: 159900, type: 'PRODUCT', sku: 'MK-PAL-001', categoryId: cats.makeup.id }),
    createItem({ name: 'Labial Matte Rojo Intenso', slug: 'labial-matte-rojo', description: 'Duración 12h, no transfiere, fórmula hidratante', price: 69900, type: 'PRODUCT', sku: 'MK-LAB-001', categoryId: cats.makeup.id }),
    // Ropa
    createItem({ name: 'Vestido de Noche Elegante', slug: 'vestido-noche-elegante', description: 'Tela de seda, corte ajustado, disponible en negro y vino', price: 289900, type: 'PRODUCT', sku: 'RP-VEST-001', categoryId: cats.clothing.id }),
    createItem({ name: 'Blusa de Seda Floral', slug: 'blusa-seda-floral', description: 'Estampado floral, manga 3/4, ideal para eventos diurnos', price: 149900, type: 'PRODUCT', sku: 'RP-BLU-001', categoryId: cats.clothing.id }),
    // Servicios
    createItem({ name: 'Maquillaje Social (Bodas / Quinceañeras)', slug: 'maquillaje-social', description: 'Incluye prueba previa, maquillaje duradero, pestañas postizas', price: 350000, type: 'SERVICE', sku: 'SRV-SOC-001', categoryId: cats.services.id }),
    createItem({ name: 'Maquillaje Artístico para Eventos', slug: 'maquillaje-artistico', description: 'Diseños creativos, glitter, body paint facial', price: 280000, type: 'SERVICE', sku: 'SRV-ART-001', categoryId: cats.services.id }),
    createItem({ name: 'Clase Personalizada de Automaquillaje', slug: 'clase-automaquillaje', description: '2 horas, técnicas básicas e intermedias, incluye kit de práctica', price: 199000, type: 'SERVICE', sku: 'SRV-CLS-001', categoryId: cats.services.id }),
  ])

  // Add images to products
  const imageUrls = [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80', // Base líquida
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&q=80', // Paleta sombras
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&q=80', // Labial
    'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&q=80', // Vestido
    'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=500&q=80', // Blusa
    'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=500&q=80', // Maquillaje social
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80', // Maquillaje artístico
    'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&q=80', // Clase maquillaje
  ]

  for (let i = 0; i < items.length; i++) {
    await prisma.media.create({
      data: {
        url: imageUrls[i],
        type: 'IMAGE',
        alt: items[i].name,
        order: 0,
        catalogItemId: items[i].id,
      },
    })
  }
  console.log('✓ Product images added')

  // Inventory solo para productos
  for (const item of items) {
    if (item.type === 'PRODUCT') {
      await prisma.inventory.create({ data: { catalogItemId: item.id, quantity: Math.floor(Math.random() * 50) + 10, lowStockThreshold: 5 } })
    }
  }

  // Customers
  const customers = await Promise.all([
    prisma.customer.create({ data: { name: 'Sofía Martínez', email: 'sofia.martinez@email.com', phone: '+57-310-111-2233', organizationId: org.id } }),
    prisma.customer.create({ data: { name: 'Valentina Gómez', email: 'valentina.gomez@email.com', phone: '+57-315-444-5566', organizationId: org.id } }),
    prisma.customer.create({ data: { name: 'Isabella Rodríguez', email: 'isabella.rodriguez@email.com', phone: '+57-300-777-8899', organizationId: org.id } }),
    prisma.customer.create({ data: { name: 'Camila Hernández', email: 'camila.hernandez@email.com', phone: '+57-317-222-3344', organizationId: org.id } }),
  ])

  // Orders & Payments
  const order1 = await prisma.order.create({
    data: {
      status: 'PENDING', paymentStatus: 'PENDING', subtotal: 479900, total: 479900,
      customerId: customers[0].id, customerName: customers[0].name, customerEmail: customers[0].email, organizationId: org.id,
      items: { create: [
        { catalogItemId: items[0].id, catalogItemName: items[0].name, quantity: 1, unitPrice: 129900, totalPrice: 129900 },
        { catalogItemId: items[3].id, catalogItemName: items[3].name, quantity: 1, unitPrice: 289900, totalPrice: 289900 },
      ]},
    },
  })
  await prisma.payment.create({ data: { orderId: order1.id, method: 'CREDIT_CARD', status: 'PAID', amount: 479900, currency: 'COP', reference: 'AQM-001', paidAt: new Date() } })

  const order2 = await prisma.order.create({
    data: {
      status: 'PENDING', paymentStatus: 'PENDING', subtotal: 350000, total: 350000,
      customerId: customers[1].id, customerName: customers[1].name, customerEmail: customers[1].email, organizationId: org.id,
      items: { create: { catalogItemId: items[5].id, catalogItemName: items[5].name, quantity: 1, unitPrice: 350000, totalPrice: 350000 } },
    },
  })
  await prisma.payment.create({ data: { orderId: order2.id, method: 'MERCADOPAGO', status: 'PENDING', amount: 350000, currency: 'COP', reference: 'AQM-002' } })

  const order3 = await prisma.order.create({
    data: {
      status: 'PENDING', paymentStatus: 'PENDING', subtotal: 348900, total: 348900,
      customerId: customers[2].id, customerName: customers[2].name, customerEmail: customers[2].email, organizationId: org.id,
      items: { create: [
        { catalogItemId: items[1].id, catalogItemName: items[1].name, quantity: 1, unitPrice: 159900, totalPrice: 159900 },
        { catalogItemId: items[4].id, catalogItemName: items[4].name, quantity: 1, unitPrice: 149900, totalPrice: 149900 },
        { catalogItemId: items[2].id, catalogItemName: items[2].name, quantity: 1, unitPrice: 69900, totalPrice: 69900 },
      ]},
    },
  })
  await prisma.payment.create({ data: { orderId: order3.id, method: 'BANK_TRANSFER', status: 'PAID', amount: 348900, currency: 'COP', reference: 'AQM-003', paidAt: new Date() } })

  console.log('\n✅ Aqua Marina seed complete!')
  console.log('Login: admin@aquamarina.com / Admin123!')
  console.log(`Modules: ${ALL_MODULES.join(', ')}`)
  console.log(`Products: ${items.length} | Customers: ${customers.length} | Orders: 3`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect(); await pool.end() })
