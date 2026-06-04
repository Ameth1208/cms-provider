import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function syncPermissions() {
  console.log('🔄 Sincronizando permisos...')
  
  const resources = [
    'catalog', 'orders', 'inventory', 'campaigns',
    'users', 'roles', 'settings', 'media', 'api_keys',
    'content', 'batches', 'reviews', 'customers', 'payments',
  ]
  const actions = ['create', 'read', 'update', 'delete', 'manage']
  
  let created = 0
  let existing = 0
  
  for (const resource of resources) {
    for (const action of actions) {
      const permission = await prisma.permission.upsert({
        where: { resource_action: { resource, action } },
        create: { resource, action, name: `${action} ${resource}` },
        update: {},
      })
      
      // Check if it was just created by seeing if it already existed
      // Since upsert returns the record either way, we can't easily tell
      // So we'll just log
      console.log(`  ✅ ${resource}:${action}`)
    }
  }
  
  console.log('\n✨ Permisos sincronizados exitosamente!')
  console.log('   Ahora debes asignar los permisos de customers y payments a tus roles.')
  console.log('   Ve a Configuración > Roles y permisos para asignarlos.')
}

syncPermissions()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
