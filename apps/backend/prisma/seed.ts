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
  console.log('🌱 Seeding database...')

  // Create organization
  const org = await prisma.organization.create({
    data: {
      name: 'Demo Store',
      slug: 'demo-store',
    },
  })
  console.log('✓ Organization created')

  // Create owner user
  const hashedPassword = await bcrypt.hash('Admin123!', 12)
  const owner = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: hashedPassword,
      name: 'Admin',
      organizationId: org.id,
    },
  })
  console.log('✓ Owner user created')

  // Create OWNER role with all permissions
  const resources = [
    'catalog', 'orders', 'inventory', 'campaigns',
    'users', 'roles', 'settings', 'media', 'api_keys',
    'content', 'batches', 'reviews', 'customers', 'payments',
    'drivers', 'returns',
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

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Electronics', slug: 'electronics', organizationId: org.id } }),
    prisma.category.create({ data: { name: 'Clothing', slug: 'clothing', organizationId: org.id } }),
    prisma.category.create({ data: { name: 'Sports', slug: 'sports', organizationId: org.id } }),
    prisma.category.create({ data: { name: 'Home', slug: 'home', organizationId: org.id } }),
    prisma.category.create({ data: { name: 'Books', slug: 'books', organizationId: org.id } }),
  ])
  console.log('✓ Categories created')

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'New', slug: 'new', organizationId: org.id } }),
    prisma.tag.create({ data: { name: 'Sale', slug: 'sale', organizationId: org.id } }),
    prisma.tag.create({ data: { name: 'Popular', slug: 'popular', organizationId: org.id } }),
    prisma.tag.create({ data: { name: 'Featured', slug: 'featured', organizationId: org.id } }),
    prisma.tag.create({ data: { name: 'Limited', slug: 'limited', organizationId: org.id } }),
  ])
  console.log('✓ Tags created')

  // Create products
  const products = await Promise.all([
    prisma.catalogItem.create({
      data: {
        name: 'Wireless Headphones',
        slug: 'wireless-headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 89.99,
        comparePrice: 129.99,
        type: 'PRODUCT',
        sku: 'ELEC-001',
        organizationId: org.id,
        categoryId: categories[0].id,
      },
    }),
    prisma.catalogItem.create({
      data: {
        name: 'Running Shoes',
        slug: 'running-shoes',
        description: 'Professional running shoes for athletes',
        price: 119.99,
        type: 'PRODUCT',
        sku: 'SPORT-001',
        organizationId: org.id,
        categoryId: categories[2].id,
      },
    }),
    prisma.catalogItem.create({
      data: {
        name: 'Cotton T-Shirt',
        slug: 'cotton-t-shirt',
        description: 'Premium cotton t-shirt',
        price: 29.99,
        type: 'PRODUCT',
        sku: 'CLOTH-001',
        organizationId: org.id,
        categoryId: categories[1].id,
      },
    }),
    prisma.catalogItem.create({
      data: {
        name: 'Coffee Maker',
        slug: 'coffee-maker',
        description: 'Automatic coffee maker with timer',
        price: 79.99,
        type: 'PRODUCT',
        sku: 'HOME-001',
        organizationId: org.id,
        categoryId: categories[3].id,
      },
    }),
    prisma.catalogItem.create({
      data: {
        name: 'Programming Book',
        slug: 'programming-book',
        description: 'Learn modern web development',
        price: 49.99,
        type: 'PRODUCT',
        sku: 'BOOK-001',
        organizationId: org.id,
        categoryId: categories[4].id,
      },
    }),
  ])
  // Add media to first 3 products
  await Promise.all([
    prisma.media.create({
      data: {
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        type: 'IMAGE',
        alt: 'Wireless Headphones',
        catalogItemId: products[0].id,
      },
    }),
    prisma.media.create({
      data: {
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        type: 'IMAGE',
        alt: 'Running Shoes',
        catalogItemId: products[1].id,
      },
    }),
    prisma.media.create({
      data: {
        url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        type: 'IMAGE',
        alt: 'Cotton T-Shirt',
        catalogItemId: products[2].id,
      },
    }),
  ])
  console.log('✓ Product images created')

  console.log('✓ Products created')

  // Create customers
  const customers = await Promise.all([
    prisma.customer.create({ data: { name: 'John Smith', email: 'john@demo.com', phone: '+1-555-0101', organizationId: org.id } }),
    prisma.customer.create({ data: { name: 'Maria Garcia', email: 'maria@demo.com', phone: '+1-555-0102', organizationId: org.id } }),
    prisma.customer.create({ data: { name: 'David Johnson', email: 'david@demo.com', phone: '+1-555-0103', organizationId: org.id } }),
    prisma.customer.create({ data: { name: 'Sarah Williams', email: 'sarah@demo.com', phone: '+1-555-0104', organizationId: org.id } }),
    prisma.customer.create({ data: { name: 'Michael Brown', email: 'michael@demo.com', phone: '+1-555-0105', organizationId: org.id } }),
  ])
  console.log('✓ Customers created')

  // Create orders
  await prisma.order.create({
    data: {
      status: 'PENDING',
      paymentStatus: 'PENDING',
      subtotal: 89.99,
      total: 89.99,
      customerId: customers[0].id,
      customerName: customers[0].name,
      customerEmail: customers[0].email,
      organizationId: org.id,
      items: {
        create: {
          catalogItemId: products[0].id,
          catalogItemName: products[0].name,
          quantity: 1,
          unitPrice: 89.99,
          totalPrice: 89.99,
        },
      },
    },
  })
  console.log('✓ Orders created')

  // Create inventory for products
  for (const product of products) {
    await prisma.inventory.create({
      data: {
        catalogItemId: product.id,
        quantity: 100,
        lowStockThreshold: 10,
      },
    })
  }
  console.log('✓ Inventory created')

  // Create drivers
  await prisma.driver.create({
    data: {
      name: 'Mike Delivery',
      email: 'mike@demo.com',
      phone: '+1-555-0201',
      licenseNumber: 'DL-001',
      vehicleType: 'Motorcycle',
      licensePlate: 'DEL-001',
      organizationId: org.id,
    },
  })
  console.log('✓ Drivers created')

  // Create zones
  await prisma.deliveryZone.create({
    data: {
      name: 'Downtown',
      coordinates: '[[-34.6037,-58.3816],[-34.6077,-58.3716],[-34.6177,-58.3816]]',
      shippingCost: 5.00,
      organizationId: org.id,
    },
  })
  console.log('✓ Zones created')

  // Create locations
  await prisma.location.create({
    data: {
      name: 'Main Warehouse',
      address: 'Av. Corrientes 1234',
      city: 'Buenos Aires',
      country: 'AR',
      latitude: -34.6037,
      longitude: -58.3816,
      isMain: true,
      organizationId: org.id,
    },
  })
  console.log('✓ Locations created')

  // Create content sections
  await prisma.homepageSection.create({
    data: {
      type: 'hero',
      title: 'Welcome to Demo Store',
      order: 0,
      active: true,
      organizationId: org.id,
    },
  })
  console.log('✓ Content sections created')

  console.log('\n✅ Seeding complete!')
  console.log('Organization:', org.name)
  console.log('Login: admin@demo.com / Admin123!')
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
