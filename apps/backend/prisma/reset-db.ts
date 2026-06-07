import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
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

async function main() {
  console.log('💥 Resetting database...')

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Disable triggers to avoid FK check errors during truncate
    await client.query('SET session_replication_role = replica')

    // Truncate all tables in dependency order
    const tables = [
      '"RolePermission"',
      '"UserRole"',
      '"CatalogItemTag"',
      '"Media"',
      '"TrackingEvent"',
      '"Delivery"',
      '"Payment"',
      '"OrderItem"',
      '"Return"',
      '"InventoryBatch"',
      '"StockMovement"',
      '"Inventory"',
      '"CatalogItemVariant"',
      '"Review"',
      '"HomepageProductSpotlight"',
      '"HomepageSlide"',
      '"HomepageBanner"',
      '"CustomerAddress"',
      '"Discount"',
      '"Order"',
      '"Customer"',
      '"Driver"',
      '"DeliveryZone"',
      '"DeliveryRoute"',
      '"Location"',
      '"ShippingMethod"',
      '"Campaign"',
      '"SystemSetting"',
      '"ApiKey"',
      '"HomepageSection"',
      '"CatalogItem"',
      '"Category"',
      '"Tag"',
      '"Role"',
      '"User"',
      '"Invitation"',
      '"Permission"',
      '"Organization"',
    ]

    for (const table of tables) {
      await client.query(`TRUNCATE TABLE ${table} CASCADE`)
    }

    await client.query('SET session_replication_role = DEFAULT')
    await client.query('COMMIT')
    console.log('✓ All data wiped')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await pool.end() })
