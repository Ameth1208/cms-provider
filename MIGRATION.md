# Migración — Nuevos campos y tablas

## Opción 1: Prisma db push (Recomendada)

En tu terminal local, con la base de datos corriendo:

```bash
cd apps/backend
npx prisma db push --accept-data-loss
```

Esto sincroniza todas las tablas nuevas:
- `Organization.modulesEnabled`
- `InventoryBatch` (lotes)
- `HomepageSection`, `HomepageSlide`, `HomepageProductSpotlight`, `HomepageBanner` (content)

Luego reseed para crear los 5 roles del sistema:

```bash
npx prisma db seed
```

## Opción 2: SQL Manual

Si no podés usar Prisma, ejecutá este SQL directamente en tu PostgreSQL:

```sql
-- 1. Agregar modulesEnabled a Organization
ALTER TABLE "Organization" ADD COLUMN "modulesEnabled" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 2. Tabla de lotes
CREATE TABLE "InventoryBatch" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "inventoryId" TEXT NOT NULL REFERENCES "Inventory"(id) ON DELETE CASCADE,
    "batchNumber" TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    "remainingQuantity" INTEGER NOT NULL DEFAULT 0,
    "costPerUnit" DOUBLE PRECISION,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    supplier TEXT,
    notes TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "InventoryBatch_inventoryId_idx" ON "InventoryBatch"("inventoryId");
CREATE INDEX "InventoryBatch_batchNumber_idx" ON "InventoryBatch"("batchNumber");

-- 3. Tablas de Content Site Web
CREATE TABLE "HomepageSection" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    type TEXT NOT NULL,
    title TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT NOT NULL REFERENCES "Organization"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "HomepageSection_organizationId_idx" ON "HomepageSection"("organizationId");
CREATE INDEX "HomepageSection_type_idx" ON "HomepageSection"(type);

CREATE TABLE "HomepageSlide" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "sectionId" TEXT NOT NULL REFERENCES "HomepageSection"(id) ON DELETE CASCADE,
    "imageUrl" TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    "ctaText" TEXT,
    "ctaLink" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true
);
CREATE INDEX "HomepageSlide_sectionId_idx" ON "HomepageSlide"("sectionId");

CREATE TABLE "HomepageProductSpotlight" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "sectionId" TEXT NOT NULL REFERENCES "HomepageSection"(id) ON DELETE CASCADE,
    "catalogItemId" TEXT NOT NULL REFERENCES "CatalogItem"(id) ON DELETE CASCADE,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "HomepageProductSpotlight_sectionId_catalogItemId_key" UNIQUE ("sectionId", "catalogItemId")
);
CREATE INDEX "HomepageProductSpotlight_sectionId_idx" ON "HomepageProductSpotlight"("sectionId");
CREATE INDEX "HomepageProductSpotlight_catalogItemId_idx" ON "HomepageProductSpotlight"("catalogItemId");

CREATE TABLE "HomepageBanner" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "sectionId" TEXT REFERENCES "HomepageSection"(id) ON DELETE SET NULL,
    "imageUrl" TEXT,
    title TEXT,
    description TEXT,
    link TEXT,
    position TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "organizationId" TEXT NOT NULL REFERENCES "Organization"(id) ON DELETE CASCADE
);
CREATE INDEX "HomepageBanner_organizationId_idx" ON "HomepageBanner"("organizationId");
CREATE INDEX "HomepageBanner_sectionId_idx" ON "HomepageBanner"("sectionId");
```
