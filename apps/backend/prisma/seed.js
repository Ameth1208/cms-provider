const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

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
      name: 'Admin Demo',
      organizationId: org.id,
    },
  })
  console.log('✓ Owner user created')

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Electronics', slug: 'electronics', organizationId: org.id } }),
    prisma.category.create({ data: { name: 'Clothing', slug: 'clothing', organizationId: org.id } }),
    prisma.category.create({ data: { name: 'Sports', slug: 'sports', organizationId: org.id } }),
  ])
  console.log('✓ Categories created')

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Sale', slug: 'sale', organizationId: org.id } }),
    prisma.tag.create({ data: { name: 'Popular', slug: 'popular', organizationId: org.id } }),
  ])
  console.log('✓ Tags created')

  // Create products
  const products = await Promise.all([
    prisma.catalogItem.create({
      data: {
        name: 'Wireless Headphones',
        slug: 'wireless-headphones',
        description: 'High-quality wireless headphones',
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
        description: 'Professional running shoes',
        price: 119.99,
        type: 'PRODUCT',
        sku: 'SPORT-001',
        organizationId: org.id,
        categoryId: categories[2].id,
      },
    }),
  ])
  console.log('✓ Products created')

  // Create customers
  const customers = await Promise.all([
    prisma.customer.create({ data: { name: 'John Smith', email: 'john@demo.com', phone: '+1-555-0101', organizationId: org.id } }),
    prisma.customer.create({ data: { name: 'Maria Garcia', email: 'maria@demo.com', phone: '+1-555-0102', organizationId: org.id } }),
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
      title: 'Welcome',
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
  })
