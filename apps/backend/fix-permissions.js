// Add missing permissions to existing organization
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const org = await prisma.organization.findFirst({ where: { name: 'Demo Store' } })
  if (!org) {
    console.log('Organization not found')
    return
  }

  const resources = ['drivers', 'returns']
  const actions = ['create', 'read', 'update', 'delete', 'manage']

  const ownerRole = await prisma.role.findFirst({
    where: { organizationId: org.id, name: 'OWNER' }
  })

  if (!ownerRole) {
    console.log('OWNER role not found')
    return
  }

  const permissionIds = []
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

  await prisma.rolePermission.createMany({
    data: permissionIds.map((permissionId) => ({ roleId: ownerRole.id, permissionId })),
    skipDuplicates: true,
  })

  console.log(`✅ Added ${permissionIds.length} permissions to OWNER role`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
