import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { URL } from 'node:url'

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

const organizationId = 'cmpljeonl0000agw6tbguv6af'

const categories = [
  { name: 'Ropa Casual', slug: 'ropa-casual' },
  { name: 'Ropa Deportiva', slug: 'ropa-deportiva' },
  { name: 'Accesorios', slug: 'accesorios' },
  { name: 'Calzado', slug: 'calzado' },
  { name: 'Hogar', slug: 'hogar' },
  { name: 'Tecnología', slug: 'tecnologia' },
]

const shippingMethods = [
  { name: 'Envío Estándar', description: 'Entrega en 3-5 días hábiles', price: 15000, estimatedDays: 5 },
  { name: 'Envío Express', description: 'Entrega en 1-2 días hábiles', price: 35000, estimatedDays: 2 },
  { name: 'Recogida en Tienda', description: 'Disponible en 24 horas', price: 0, estimatedDays: 1 },
  { name: 'Envío Same-Day', description: 'Entrega el mismo día (solo Barranquilla)', price: 25000, estimatedDays: 1 },
]

// Productos con contexto colombiano/barranquillero
const products = [
  {
    name: 'Camiseta Clásica Barranquilla',
    slug: 'camiseta-clasica-barranquilla',
    description: 'Camiseta 100% algodón con diseño inspirado en la ventana de Barranquilla. Perfecta para el clima tropical caribeño.',
    price: 89900,
    type: 'PRODUCT',
    sku: 'CBB-001',
    categorySlug: 'ropa-casual',
    featured: true,
    label: 'Más Vendido',
  },
  {
    name: 'Vestido Playero Floral',
    slug: 'vestido-playero-floral',
    description: 'Vestido ligero con estampado floral ideal para la playa o paseos por el malecón. Tela fresca y transpirable.',
    price: 159900,
    type: 'PRODUCT',
    sku: 'VPF-002',
    categorySlug: 'ropa-casual',
    featured: true,
    label: 'Nuevo',
  },
  {
    name: 'Short Deportivo Running',
    slug: 'short-deportivo-running',
    description: 'Short ligero con tecnología Dry-Fit. Ideal para correr por la ciclovía de la 84 o ejercitarse al aire libre.',
    price: 79900,
    type: 'PRODUCT',
    sku: 'SDR-003',
    categorySlug: 'ropa-deportiva',
    featured: false,
  },
  {
    name: 'Leggings Fitness Premium',
    slug: 'leggings-fitness-premium',
    description: 'Leggings de alta compresión con bolsillo lateral. Perfecto para el gimnasio o clases de yoga.',
    price: 119900,
    type: 'PRODUCT',
    sku: 'LFP-004',
    categorySlug: 'ropa-deportiva',
    featured: true,
  },
  {
    name: 'Gorra Trucker Carnaval',
    slug: 'gorra-trucker-carnaval',
    description: 'Gorra estilo trucker con malla trasera. Diseño exclusivo inspirado en el Carnaval de Barranquilla.',
    price: 49900,
    type: 'PRODUCT',
    sku: 'GTC-005',
    categorySlug: 'accesorios',
    featured: true,
    label: 'Edición Limitada',
  },
  {
    name: 'Bolso Playero Grande',
    slug: 'bolso-playero-grande',
    description: 'Bolso espacioso con compartimento impermeable. Ideal para días de playa en Puerto Velero o Santa Verónica.',
    price: 129900,
    type: 'PRODUCT',
    sku: 'BPG-006',
    categorySlug: 'accesorios',
    featured: false,
  },
  {
    name: 'Sandalias Huarache',
    slug: 'sandalias-huarache',
    description: 'Sandalias artesanales estilo huarache. Cómodas y frescas para el clima cálido de la costa caribe.',
    price: 99900,
    type: 'PRODUCT',
    sku: 'SH-007',
    categorySlug: 'calzado',
    featured: true,
  },
  {
    name: 'Tennis Running Air',
    slug: 'tennis-running-air',
    description: 'Tennis con tecnología de amortiguación. Perfectos para correr por el parque de la 93 o la ciclovía.',
    price: 289900,
    type: 'PRODUCT',
    sku: 'TRA-008',
    categorySlug: 'calzado',
    featured: true,
    label: 'Top Rated',
  },
  {
    name: 'Hamaca Caribeña',
    slug: 'hamaca-caribena',
    description: 'Hamaca tejida a mano en algodón. Ideal para descansar en el patio o terraza con la brisa del mar.',
    price: 189900,
    type: 'PRODUCT',
    sku: 'HC-009',
    categorySlug: 'hogar',
    featured: true,
  },
  {
    name: 'Set de Cojines Tropicales',
    slug: 'set-cojines-tropicales',
    description: 'Set de 3 cojines con estampados tropicales. Añade color y estilo caribeño a tu sala.',
    price: 139900,
    type: 'PRODUCT',
    sku: 'SCT-010',
    categorySlug: 'hogar',
    featured: false,
  },
  {
    name: 'Audífonos Bluetooth Pro',
    slug: 'audifonos-bluetooth-pro',
    description: 'Audífonos inalámbricos con cancelación de ruido. Perfectos para entrenar o trabajar desde casa.',
    price: 249900,
    type: 'PRODUCT',
    sku: 'ABP-011',
    categorySlug: 'tecnologia',
    featured: true,
    label: 'Nuevo',
  },
  {
    name: 'Power Bank Solar',
    slug: 'power-bank-solar',
    description: 'Cargador portátil con panel solar. Ideal para días de playa o camping en la región caribe.',
    price: 179900,
    type: 'PRODUCT',
    sku: 'PBS-012',
    categorySlug: 'tecnologia',
    featured: false,
  },
  {
    name: 'Camisa Guayabera Premium',
    slug: 'camisa-guayabera-premium',
    description: 'Camisa guayabera 100% lino. Elegante y fresca, perfecta para eventos formales en el clima tropical.',
    price: 199900,
    type: 'PRODUCT',
    sku: 'CGP-013',
    categorySlug: 'ropa-casual',
    featured: true,
  },
  {
    name: 'Bañador Tropical',
    slug: 'banador-tropical',
    description: 'Bañador con estampado tropical. Secado rápido ideal para playas del Caribe colombiano.',
    price: 89900,
    type: 'PRODUCT',
    sku: 'BT-014',
    categorySlug: 'ropa-casual',
    featured: false,
  },
  {
    name: 'Mochila Antirrobo',
    slug: 'mochila-antirrobo',
    description: 'Mochila con compartimentos ocultos y puerto USB. Perfecta para moverse seguro por la ciudad.',
    price: 159900,
    type: 'PRODUCT',
    sku: 'MA-015',
    categorySlug: 'accesorios',
    featured: true,
  },
]

// Clientes con ubicaciones al norte de Barranquilla
const customers = [
  {
    name: 'María Fernanda López',
    email: 'mafer.lopez@email.com',
    phone: '+57 300 123 4567',
    document: '1.045.678.901',
    documentType: 'CC',
    addresses: [
      {
        label: 'Casa',
        street: 'Cra 53 # 82 - 120, Edificio Riomar Plaza, Apto 402',
        city: 'Barranquilla',
        state: 'Atlántico',
        zip: '080020',
        country: 'CO',
        isDefault: true,
      },
      {
        label: 'Oficina',
        street: 'Calle 84 # 51 - 100, Centro Empresarial Villa Campestre, Oficina 301',
        city: 'Barranquilla',
        state: 'Atlántico',
        zip: '080020',
        country: 'CO',
        isDefault: false,
      },
    ],
  },
  {
    name: 'Carlos Andrés Martínez',
    email: 'carlos.martinez@email.com',
    phone: '+57 315 234 5678',
    document: '1.098.765.432',
    documentType: 'CC',
    addresses: [
      {
        label: 'Casa',
        street: 'Carrera 57 # 90 - 45, Urbanización Altos de Riomar, Casa 12',
        city: 'Barranquilla',
        state: 'Atlántico',
        zip: '080020',
        country: 'CO',
        isDefault: true,
      },
    ],
  },
  {
    name: 'Ana Patricia Gómez',
    email: 'ana.gomez@email.com',
    phone: '+57 301 345 6789',
    document: '52.678.901',
    documentType: 'CE',
    addresses: [
      {
        label: 'Apartamento',
        street: 'Calle 85 # 53 - 200, Conjunto Residencial Buenavista, Torre 2, Apto 1503',
        city: 'Barranquilla',
        state: 'Atlántico',
        zip: '080020',
        country: 'CO',
        isDefault: true,
      },
      {
        label: 'Trabajo',
        street: 'Vía 40 # 73 - 280, Centro Comercial Viva Barranquilla, Local 45',
        city: 'Barranquilla',
        state: 'Atlántico',
        zip: '080020',
        country: 'CO',
        isDefault: false,
      },
    ],
  },
  {
    name: 'José Miguel Rodríguez',
    email: 'jose.rodriguez@email.com',
    phone: '+57 304 456 7890',
    document: '79.123.456',
    documentType: 'NIT',
    addresses: [
      {
        label: 'Empresa',
        street: 'Carrera 52 # 80 - 150, Edificio Ciudad Jardín, Oficina 505',
        city: 'Barranquilla',
        state: 'Atlántico',
        zip: '080020',
        country: 'CO',
        isDefault: true,
      },
    ],
  },
  {
    name: 'Laura Cristina Vargas',
    email: 'laura.vargas@email.com',
    phone: '+57 310 567 8901',
    document: '1.123.456.789',
    documentType: 'CC',
    addresses: [
      {
        label: 'Casa',
        street: 'Calle 96 # 49 - 300, Conjunto Residencial La Castellana, Casa 28',
        city: 'Barranquilla',
        state: 'Atlántico',
        zip: '080020',
        country: 'CO',
        isDefault: true,
      },
    ],
  },
  {
    name: 'Luis Eduardo Pérez',
    email: 'luis.perez@email.com',
    phone: '+57 317 678 9012',
    document: '1.234.567.890',
    documentType: 'CC',
    addresses: [
      {
        label: 'Casa Principal',
        street: 'Carrera 47 # 82 - 60, Urbanización Villa Country, Casa 45',
        city: 'Barranquilla',
        state: 'Atlántico',
        zip: '080020',
        country: 'CO',
        isDefault: true,
      },
      {
        label: 'Casa Playa',
        street: 'Km 8 Vía al Mar, Condominio Villa del Este, Casa 12',
        city: 'Puerto Colombia',
        state: 'Atlántico',
        zip: '081008',
        country: 'CO',
        isDefault: false,
      },
    ],
  },
]

async function main() {
  console.log('🌱 Iniciando seed de datos para Barranquilla...')

  // Crear categorías
  console.log('📁 Creando categorías...')
  const createdCategories: Record<string, string> = {}
  for (const cat of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug_organizationId: { slug: cat.slug, organizationId } }
    })
    if (!existing) {
      const created = await prisma.category.create({
        data: { ...cat, organizationId }
      })
      createdCategories[cat.slug] = created.id
      console.log(`  ✅ ${cat.name}`)
    } else {
      createdCategories[cat.slug] = existing.id
      console.log(`  ℹ️  ${cat.name} (ya existe)`)
    }
  }

  // Crear métodos de envío
  console.log('🚚 Creando métodos de envío...')
  for (const method of shippingMethods) {
    const existing = await prisma.shippingMethod.findFirst({
      where: { name: method.name, organizationId }
    })
    if (!existing) {
      await prisma.shippingMethod.create({
        data: { ...method, organizationId }
      })
      console.log(`  ✅ ${method.name}`)
    } else {
      console.log(`  ℹ️  ${method.name} (ya existe)`)
    }
  }

  // Crear productos
  console.log('📦 Creando productos...')
  for (const product of products) {
    const existing = await prisma.catalogItem.findUnique({
      where: { slug_organizationId: { slug: product.slug, organizationId } }
    })
    if (!existing) {
      const { categorySlug, ...productData } = product
      await prisma.catalogItem.create({
        data: {
          ...productData,
          organizationId,
          categoryId: createdCategories[categorySlug] || null,
          inventory: {
            create: {
              quantity: Math.floor(Math.random() * 100) + 20,
              lowStockThreshold: 10,
            }
          }
        }
      })
      console.log(`  ✅ ${product.name}`)
    } else {
      console.log(`  ℹ️  ${product.name} (ya existe)`)
    }
  }

  // Crear clientes con direcciones
  console.log('👥 Creando clientes...')
  for (const customer of customers) {
    const existing = await prisma.customer.findUnique({
      where: { email_organizationId: { email: customer.email, organizationId } }
    })
    if (!existing) {
      const { addresses, ...customerData } = customer
      await prisma.customer.create({
        data: {
          ...customerData,
          organizationId,
          addresses: {
            create: addresses
          }
        }
      })
      console.log(`  ✅ ${customer.name}`)
    } else {
      console.log(`  ℹ️  ${customer.name} (ya existe)`)
    }
  }

  console.log('\n✨ Seed completado exitosamente!')
  console.log(`📍 Datos creados para organización: ${organizationId}`)
  console.log('\n🏖️  Productos disponibles:')
  console.log('   - Ropa casual y deportiva para clima tropical')
  console.log('   - Accesorios inspirados en el Carnaval de Barranquilla')
  console.log('   - Productos para playa y estilo de vida caribeño')
  console.log('\n🏠 Direcciones al norte de Barranquilla:')
  console.log('   - Riomar, Villa Campestre, Altos de Riomar')
  console.log('   - Buenavista, Ciudad Jardín, La Castellana')
  console.log('   - Villa Country, Villa del Este, Puerto Colombia')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
