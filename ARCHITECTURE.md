# CMS Web Manager — Architecture

> Documento vivo de arquitectura y progreso del proyecto.

---

## 1. Overview

CMS Web Manager es un sistema de gestión de contenido multi-tenant para catálogo de productos/servicios, pedidos, inventario y campañas. Está diseñado como monorepo con backend API REST, frontend web app y paquete de tipos compartidos.

**Modelo de negocio:** Multi-organización. Cada organización tiene su propio catálogo, usuarios, roles, pedidos e inventario. Los usuarios pertenecen a una única organización.

---

## 2. Tech Stack

| Capa | Tecnología |
|------|------------|
| **Runtime** | Node.js 20+ |
| **Package Manager** | pnpm + Bun (ejecución) |
| **Monorepo** | pnpm workspaces |
| **Backend** | NestJS 11 |
| **Frontend** | Next.js 16 (App Router) |
| **Database** | PostgreSQL 16 |
| **ORM** | Prisma 7 |
| **Auth** | JWT (access 24h / refresh) + API Keys |
| **UI** | shadcn/ui + TailwindCSS |
| **Font** | Poppins (300, 400, 500, 600) |
| **State** | Zustand |
| **Icons** | Iconify (`@iconify/react`) |
| **i18n** | Custom hook + JSON namespaces |
| **Docs API** | Swagger + Scalar |
| **Storage** | S3-compatible (MinIO) |
| **Real-time** | Socket.IO (WebSocket) |

---

## 3. Monorepo Structure

```
cms-web-manager/
├── apps/
│   ├── backend/          # NestJS API
│   └── frontend/         # Next.js 16 App Router
├── packages/
│   └── shared/           # Tipos TypeScript + constantes
├── docker-compose.yml    # PostgreSQL
├── pnpm-workspace.yaml
└── ARCHITECTURE.md       # Este documento
```

---

## 4. Backend Architecture (`apps/backend`)

### 4.1 Modules

| Módulo | Responsabilidad |
|--------|-----------------|
| `auth` | Login/register JWT, refresh tokens, perfil |
| `users` | CRUD usuarios, asignación de roles |
| `roles-permissions` | Roles, permisos RBAC por organización |
| `catalog` | Productos, servicios, categorías, tags, variantes, SEO, descuentos |
| `inventory` | Stock, movimientos, umbrales de alerta |
| `orders` | Pedidos, items, estados, WebSocket real-time |
| `campaigns` | Campañas promocionales + descuentos |
| `reviews` | Reseñas de productos |
| `media` | Upload a S3/MinIO, gestión de archivos |
| `company-settings` | System settings, API keys |

### 4.2 Auth & Authorization

- **JWT**: Access token (24h) + Refresh token. Payload incluye `userId`, `email`, `organizationId`, `permissions[]`.
- **API Keys**: Fallback para integraciones. Header `api-key`. Hash almacenado en BD.
- **Guard**: `HybridAuthGuard` — intenta JWT primero, luego API key.
- **Permissions**: Decorador `@RequirePermission(resource, action)` + `PermissionGuard`.
- **CurrentUser**: Decorador `@CurrentUser('organizationId')` inyecta el tenant en cada service call.

### 4.3 Data Access Pattern

- **No repository abstraction**. Services llaman directo a `PrismaService`.
- **Includes consistentes**: `baseInclude` y `includeWithInventory` compartidos en `CatalogService`.
- **Multi-tenancy**: Todos los `where` incluyen `organizationId`.

### 4.4 File Storage

- Interface `IStorageProvider` con implementación `S3Provider` (MinIO-compatible).
- Uploads vía pre-signed URLs o directo al bucket.

### 4.5 Real-time

- `OrdersGateway` (Socket.IO) en namespace `/orders`.
- Emite `order.created` y `order.status` a rooms `org:${organizationId}`.

---

## 5. Frontend Architecture (`apps/frontend`)

### 5.1 App Router Structure

```
src/app/
├── (auth)/                    # Grupo sin layout de dashboard
│   └── login/
│       └── page.tsx
├── (dashboard)/               # Grupo con sidebar + auth guard
│   ├── layout.tsx             # Auth redirect + AppSidebar
│   ├── page.tsx               # Home / dashboard
│   ├── catalog/
│   │   ├── page.tsx           # Grid de cards con filtros
│   │   ├── [id]/
│   │   │   └── page.tsx       # Crear / Editar (id=create o UUID)
│   │   ├── categories/
│   │   ├── tags/
│   │   ├── components/
│   │   │   ├── catalog-card-grid.tsx
│   │   │   ├── catalog-form/
│   │   │   │   ├── basic-info-section.tsx
│   │   │   │   ├── details-section.tsx
│   │   │   │   ├── variants-section.tsx
│   │   │   │   ├── media-section.tsx
│   │   │   │   ├── seo-visibility-section.tsx
│   │   │   │   ├── organization-section.tsx
│   │   │   │   ├── product-preview.tsx
│   │   │   │   └── form-tabs.tsx
│   │   ├── hooks/
│   │   │   ├── use-catalog.ts
│   │   │   ├── use-catalog-form.ts
│   │   │   ├── use-inline-create.ts
│   │   │   └── use-media-upload.ts
│   │   └── store/
│   │       ├── catalog-store.ts
│   │       └── catalog-form-store.ts
│   ├── orders/
│   ├── inventory/
│   ├── campaigns/
│   ├── users/
│   ├── settings/
│   └── api-keys/
├── layout.tsx                 # Root layout (font Poppins, DOM workaround)
└── providers.tsx              # ThemeProvider + Toaster
```

### 5.2 State Management

- **Zustand** por módulo. Cada feature tiene su propio store.
- **Catalog form store**: Estado completo del formulario de 6 tabs (info, detalles, variantes, archivos, SEO, organización).
- **Pattern**: Selectores por campo para evitar re-renders innecesarios en submit.

### 5.3 Auth Pattern

- **Custom `AuthContext`** con localStorage (`{ token, user }`).
- **No NextAuth**. Eliminado en refactor reciente.
- **API Client**: `api.get|post|put|delete(path, body?, token)` — `fetch` wrapper simple.
- **Protected routes**: `DashboardLayout` hace redirect a `/login` si no hay token válido.

### 5.4 UI System

- **shadcn/ui** como base de componentes (Button, Input, Card, Dialog, Popover, Command, etc).
- **TailwindCSS** con variables CSS (`--background`, `--foreground`, etc).
- **Poppins** cargada vía `next/font/google`.
- **Iconos**: `@iconify/react` con prefijo `lucide:`.
- **Utility**: `cn()` de `clsx` + `tailwind-merge` para clases condicionales.

### 5.5 i18n

- Hook custom `useTranslation()`.
- JSON files por idioma y namespace (`es/catalog.json`, `en/catalog.json`, etc).
- 9 namespaces por idioma.
- Catálogo completamente cableado a i18n (~85+ claves).

### 5.6 Known Issues & Workarounds

| Issue | Workaround |
|-------|------------|
| Extensión Chrome (`eppiocemhmnlbhjplcgkofciiegomcon`) intercepta `appendChild` y crashea React | Script en `<head>` que guarda referencias nativas DOM antes de que la extensión las modifique. Solución real: desactivar extensión o usar incógnito. |
| Hydration mismatch por atributos inyectados (`__processed_...`, `bis_register`) | `suppressHydrationWarning` en `<html>` y `<body>` |

---

## 6. Database Schema (`prisma/schema.prisma`)

### 6.1 Enums

```
CatalogItemType          = PRODUCT | SERVICE
CatalogItemDiscountType  = PERCENTAGE | FIXED
OrderStatus              = PENDING | CONFIRMED | PROCESSING | SHIPPED | DELIVERED | CANCELLED
MediaType                = IMAGE | VIDEO | AUDIO | DOCUMENT
MovementType             = IN | OUT | ADJUSTMENT
DiscountType             = PERCENTAGE | FIXED
```

### 6.2 Models (18 tablas)

| Modelo | Campos clave | Relaciones |
|--------|-------------|------------|
| `Organization` | `id`, `name`, `slug` | Users, Roles, CatalogItems, Tags, Categories, Orders, Campaigns, SystemSettings, ApiKeys, Reviews |
| `User` | `id`, `email`, `password`, `name`, `active` | Organization, UserRole[] |
| `Role` | `id`, `name`, `description` | Organization, RolePermission[], UserRole[] |
| `Permission` | `id`, `resource`, `action`, `name` | RolePermission[] |
| `CatalogItem` | `id`, `name`, `slug`, `price`, `comparePrice`, `discountType`, `discountValue`, `type`, `sku`, `barcode`, `active`, `visibility`, `featured`, `label`, `brand`, `material`, `gender`, `season`, `fit`, `weight`, `dimensions`, `country`, `careInstructions`, `metaTitle`, `metaDescription` | Organization, Category, CatalogItemTag[], Media[], Inventory?, Review[], CatalogItemVariant[] |
| `CatalogItemVariant` | `id`, `name`, `sku`, `color`, `colorHex`, `size`, `price`, `stock`, `active` | CatalogItem |
| `Tag` | `id`, `name`, `slug` | Organization, CatalogItemTag[] |
| `Category` | `id`, `name`, `slug`, `parentId` | Organization, parent/children (self-ref), CatalogItem[] |
| `Media` | `id`, `url`, `type`, `alt`, `order` | CatalogItem |
| `Order` | `id`, `status`, `subtotal`, `discount`, `total`, `customerName`, `customerEmail`, `customerPhone`, `notes`, `couponCode` | Organization, OrderItem[] |
| `OrderItem` | `id`, `catalogItemId`, `catalogItemName`, `quantity`, `unitPrice`, `totalPrice` | Order |
| `Inventory` | `id`, `quantity`, `lowStockThreshold` | CatalogItem, StockMovement[] |
| `StockMovement` | `id`, `type`, `quantity`, `reason`, `reference` | Inventory |
| `Campaign` | `id`, `name`, `description`, `startDate`, `endDate`, `active`, `autoApply` | Organization, Discount[] |
| `Discount` | `id`, `type`, `value`, `code`, `maxUses`, `usedCount` | Campaign |
| `Review` | `id`, `userName`, `userEmail`, `rating`, `comment` | CatalogItem, Organization |
| `SystemSetting` | `id`, `key`, `value` | Organization |
| `ApiKey` | `id`, `name`, `keyHash`, `keyPrefix`, `permissions[]`, `active`, `lastUsedAt` | Organization |

### 6.3 ID Strategy

- **UUID v4** en todos los modelos (`@default(uuid())`).
- Cambiado desde CUID en refactor reciente.

---

## 7. Shared Package (`packages/shared`)

Exporta:
- `types/` — Interfaces TypeScript consumidas por backend y frontend (CatalogItem, Order, User, etc).
- `constants/` — Constantes compartidas.

No tiene lógica de runtime, solo contratos de tipo.

---

## 8. Progress Log

### ✅ Completado

| Feature | Detalle |
|---------|---------|
| **Auth refactor** | NextAuth eliminado. Reemplazado por `AuthContext` con localStorage (`{ token, user }`). JWT 24h expiration. |
| **Schema extendido** | Nuevos campos en `CatalogItem`: barcode, brand, material, gender, season, fit, weight, dimensions, country, careInstructions, metaTitle, metaDescription, visibility, featured, label. IDs migrados de CUID a UUID. |
| **Variantes** | Nuevo modelo `CatalogItemVariant` (name, color, colorHex, size, sku, price, stock, active). CRUD completo en backend. Generador visual de variantes (colores × tallas) en frontend. |
| **Descuentos** | `comparePrice`, `discountType` (PERCENTAGE/FIXED), `discountValue`, `finalPrice` calculado automáticamente. |
| **Formulario 6 tabs** | Básico \| Detalles \| Variantes \| Archivos (fotos+docs) \| SEO \| Organización. |
| **Media** | Upload de imágenes, videos y documentos PDF. Drag & drop independiente por tipo. Reordenar thumbnails. |
| **Header sticky** | Quitado `overflow-y-auto` del `main` para que `position: sticky` funcione en viewport. Header full-width con márgenes negativos. |
| **Multiidioma** | Custom hook `useTranslation`. JSONs `es/catalog.json` y `en/catalog.json` extendidos con ~85+ claves. Todos los componentes del catálogo cableados. |
| **Grid de cards** | Reemplazada tabla HTML por grid responsive de cards con imágenes, badges de estado, precio con descuento tachado, overlay de acciones (editar/eliminar). |
| **Ficha técnica / Documentos** | `MediaSection` separa fotos/videos de documentos (PDF). Lista de documentos con iconos e índice. |
| **Creación inline** | `useInlineCreate` recibe `name` como parámetro directo, evitando stale state de Zustand. |
| **SearchSelect visual** | `organization-section.tsx` usa `CategorySelect` y `TagInput` custom: dropdown visual con iconos para categorías, input token al estilo Notion/Linear para tags con chips de colores. |
| **Bugfixes** | `discountType: ''` → `null` en backend (evita error 500 de enum Prisma). Update de variantes extrae `id` antes de `createMany` (evita conflictos de PK). |
| **Build verificado** | Frontend y backend compilan sin errores. |

### 🔄 En progreso / Pendiente

| Feature | Estado |
|---------|--------|
| **Sidebar redesign** | Usuario reportó que el diseño actual es "raro". Pendiente rediseño moderno. |
| **Orders UI** | Backend completo, frontend básico. |
| **Inventory UI** | Backend completo, frontend básico. |
| **Campaigns UI** | Backend completo, frontend básico. |
| **Users & Roles UI** | Backend completo, frontend básico. |
| **Settings / Company** | Backend completo, frontend básico. |
| **API Keys** | Backend completo, frontend básico. |
| **Reviews** | Backend completo, sin UI. |
| **Real-time orders** | WebSocket backend listo, sin integración frontend. |

### 🐛 Issues activos

| Issue | Workaround / Plan |
|-------|-------------------|
| Extensión Chrome crashea React | Script de protección en `layout.tsx`. Solución definitiva: desactivar extensión o incógnito. |
| Hydration mismatch | `suppressHydrationWarning` en root. |

---

## 9. Naming Conventions

- **Files**: kebab-case obligatorio (`use-catalog-form.ts`, `product-preview.tsx`).
- **Components**: PascalCase (`OrganizationSection.tsx`).
- **Hooks**: camelCase con prefijo `use` (`useInlineCreate`).
- **Stores**: camelCase con sufijo `Store` (`catalogFormStore`).
- **Backend**: controller/service filenames en kebab-case o camelCase según NestJS convention.

---

## 10. Environment Variables

### Backend (`apps/backend/.env`)
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
FRONTEND_URL=http://localhost:3000
AWS_S3_BUCKET=...
AWS_S3_ENDPOINT=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

### Frontend (`apps/frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:4002/api
```

---

*Última actualización: 2026-06-02*
