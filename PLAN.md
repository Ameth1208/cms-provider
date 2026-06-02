# CMS Web Manager — Plan de Desarrollo

## 1. Visión General

Plataforma multi-tenant para gestión de contenido (CMS), catálogo, pedidos, inventario, campañas y configuración de empresa. Backend NestJS + Frontend Next.js con RBAC granular por organización.

---

## 2. Stack Técnico

| Capa | Tecnología |
|------|-----------|
| Monorepo | pnpm workspaces |
| Backend | NestJS + Prisma 7 + PostgreSQL (pgvector) |
| Frontend | Next.js 16 + React 18 |
| UI | shadcn/ui + TailwindCSS 3.4 + Iconify |
| Estado | Zustand (stores por módulo) |
| Autenticación | JWT (backend) + NextAuth (frontend) |
| Tema | next-themes (dark/light) |
| i18n | Custom hook con JSON por módulo (es/en) |
| Archivos | S3 (MinIO/AWS) |

---

## 3. Sistema de Diseño

### Reglas absolutas

1. **NO usar colores fijos de Tailwind** (`text-slate-900`, `bg-white`, `text-red-600`, etc.)
2. **SIEMPRE usar variables CSS** definidas en `globals.css`: `text-foreground`, `bg-card`, `border-border`, `text-muted-foreground`, `text-destructive`, `bg-muted`, etc.
3. **NO usar `min-h-screen`** — usar `min-h-dvh`
4. **NO usar `font-bold` (700+)** — usar `font-light`, `font-normal`, `font-medium`
5. **Bordes**: `border border-input` o `border border-border`, NUNCA `border-slate-*`
6. **Componentes**: todo en `components/ui/` con nombres en **kebab-case**
7. **Íconos**: solo `@iconify/react` con prefijo `lucide:`
8. **Estado**: zustand stores por módulo, NO estado local para datos compartidos

### Paleta de colores (variables CSS en `globals.css`)

```
--background     → fondo principal
--foreground     → texto principal
--card           → fondo de tarjetas
--card-foreground → texto en tarjetas
--primary        → color principal (botones, links)
--primary-foreground → texto sobre primary
--secondary      → fondo secundario
--muted          → fondo sutil (inputs, áreas secundarias)
--muted-foreground → texto secundario
--accent         → fondo resaltado (hover, selección)
--border         → bordes
--input          → bordes de inputs
--destructive    → color de error
--ring           → anillo de focus
```

Ejemplo de uso correcto:
```tsx
// BIEN
<div className="bg-card text-card-foreground border border-border rounded-2xl p-8">
  <h1 className="text-foreground">Título</h1>
  <p className="text-muted-foreground">Descripción</p>
  <Input /> {/* usa text-foreground bg-background border-input automático */}
</div>

// MAL
<div className="bg-white text-slate-900 border-slate-200">
  <h1 className="text-gray-900">Título</h1>
</div>
```

---

## 4. Estructura del Proyecto

```
apps/
  backend/                        # NestJS API
    src/
      modules/
        auth/                     # Login, registro, JWT
        users/                    # CRUD usuarios
        roles-permissions/        # RBAC
        catalog/                  # Items, categorías, tags
        media/                    # Upload S3
        orders/                   # Pedidos
        inventory/                # Inventario y movimientos
        campaigns/                # Promociones y cupones
        company-settings/         # Config por organización
      common/                     # Guards, decorators, pipes
    prisma/
      schema.prisma               # Modelo de datos

  frontend/                       # Next.js App
    src/
      app/
        (auth)/                   # Rutas públicas
          login/                  # Página de login
        (dashboard)/              # Rutas protegidas
          layout.tsx              # Sidebar + contenido
          page.tsx                # Dashboard home
          catalog/                # Módulo catálogo
            page.tsx              # Lista de items
            [id]/page.tsx         # Crear/editar item
            categories/page.tsx   # CRUD categorías
            tags/page.tsx         # CRUD tags
            components/           # Componentes del módulo
            hooks/                # Hooks del módulo
            store/                # Zustand store del módulo
          orders/                 # Módulo pedidos
          inventory/              # Módulo inventario
          campaigns/              # Módulo campañas
          users/                  # Módulo usuarios
          settings/               # Módulo configuración
        components/               # Componentes compartidos
          app-sidebar.tsx         # Sidebar principal
      components/ui/              # shadcn components
      hooks/                      # Hooks globales
      i18n/                       # Internacionalización
        es/                       # Español (por módulo)
          common.json
          auth.json
          nav.json
          catalog.json
          ...
        en/                       # Inglés (por módulo)
        use-translation.ts        # Hook t()
      store/                      # Zustand stores globales
        locale-store.ts
        modules/
          settings-store.ts
      styles/
        globals.css               # Variables CSS + Tailwind
      lib/
        api-client.ts             # Cliente HTTP
        utils.ts                  # cn()

packages/
  shared/                         # Tipos compartidos
    src/types/
      auth.ts
      catalog.ts
      company.ts
      media.ts
      order.ts
      inventory.ts
      campaign.ts
```

---

## 5. Estado Actual

### Funcionando
- [x] Backend NestJS con 10 módulos
- [x] Prisma 7 con adapter-pg + seed (admin, permisos, roles)
- [x] Autenticación JWT + NextAuth
- [x] CRUD catálogo (items, categorías, tags)
- [x] SEO metadata computado por backend
- [x] shadcn/ui components (Button, Input, Card, Select, etc.)
- [x] Sidebar colapsable con shadcn Sidebar
- [x] Modo oscuro/claro con next-themes
- [x] i18n modular ES/EN
- [x] Zustand stores por módulo
- [x] Configuración de empresa (settings page)
- [x] Login con show/hide password
- [x] Variables CSS como fuente única de color

### Pendiente
- [ ] Media upload (S3/MinIO)
- [ ] Gestión de pedidos (listado, detalle, cambio de estado)
- [ ] Gestión de inventario (stock, movimientos, alertas)
- [ ] Campañas y cupones
- [ ] Gestión de usuarios y roles
- [ ] Dashboard con estadísticas reales
- [ ] WebSocket para notificaciones en tiempo real
- [ ] Carga de imágenes en formulario de catálogo
- [ ] Vista previa de productos (frontend público)

---

## 6. Plan por Módulo

### 6.1 Catálogo (PRIORIDAD ALTA)
**Backend listo.** Frontend pendiente:

- [ ] Upload de imágenes (arrastrar/soltar, preview, reordenar)
- [ ] Campos adicionales en producto: peso, dimensiones, stock inicial
- [ ] Variantes de producto (talla, color)
- [ ] Vista previa del item (página pública simulada)
- [ ] Bulk actions (activar/desactivar múltiples)
- [ ] Exportar catálogo (CSV/JSON)

### 6.2 Pedidos (PRIORIDAD ALTA)
- [ ] Listado con filtros (estado, fecha, cliente)
- [ ] Detalle del pedido (items, total, dirección)
- [ ] Cambio de estado (pendiente → procesando → enviado → entregado)
- [ ] Notas internas
- [ ] WebSocket para nuevos pedidos

### 6.3 Inventario (PRIORIDAD MEDIA)
- [ ] Vista de stock por producto
- [ ] Ajustes de inventario (entrada/salida manual)
- [ ] Historial de movimientos
- [ ] Alertas de stock bajo
- [ ] Umbrales configurables

### 6.4 Campañas (PRIORIDAD MEDIA)
- [ ] CRUD de campañas (descuento %, monto fijo)
- [ ] Códigos de cupón
- [ ] Reglas: fecha inicio/fin, uso máximo, productos aplicables
- [ ] Auto-aplicar vs código manual

### 6.5 Usuarios y Roles (PRIORIDAD BAJA)
- [ ] CRUD de usuarios
- [ ] Asignación de roles
- [ ] Permisos granulares

### 6.6 Dashboard (PRIORIDAD MEDIA)
- [ ] KPIs: ventas hoy/semana/mes, pedidos pendientes, stock bajo
- [ ] Gráfico de ingresos
- [ ] Últimos pedidos
- [ ] Productos más vendidos

### 6.7 Media / Archivos (PRIORIDAD ALTA)
- [ ] Upload a S3/MinIO
- [ ] Tipos: imágenes, documentos
- [ ] Thumbnails automáticos
- [ ] Galería en items del catálogo

---

## 7. API Endpoints por Módulo

| Módulo | Endpoints | Estado |
|--------|-----------|--------|
| Auth | POST login, POST register, POST refresh, POST me | Listo |
| Users | GET, GET :id, POST, PUT :id, DELETE :id | Listo |
| Roles | GET, GET :id, POST, PUT :id, DELETE :id | Listo |
| Permissions | GET | Listo |
| Catalog | GET, GET :id, GET slug/:slug, POST, PUT :id, DELETE :id | Listo |
| Catalog Tags | GET all, POST, DELETE :id | Listo |
| Catalog Categories | GET all, POST, DELETE :id | Listo |
| Media | POST upload/:catalogItemId, DELETE :id, POST reorder | Listo |
| Orders | GET, GET stats, GET :id, POST, POST :id/status | Listo |
| Inventory | GET, GET low-stock, GET :catalogItemId, GET :catalogItemId/movements, POST adjust, POST threshold | Listo |
| Campaigns | GET, GET :id, POST, PUT :id, POST :id/toggle, DELETE :id, POST auto-deactivate | Listo |
| Settings | GET, PUT | Listo |

---

## 8. Reglas de Desarrollo

1. **Nunca hacer build** — el usuario prueba en `next dev` en tiempo real
2. **Colores solo de variables CSS** (`globals.css`)
3. **Nada de `min-h-screen`** — siempre `min-h-dvh`
4. **Componentes en kebab-case** (`catalog-table.tsx`, no `CatalogTable.tsx`)
5. **Nada de `font-bold`** — máximo `font-medium`
6. **Íconos solo Iconify** con `lucide:*`
7. **i18n en todas las cadenas visibles** con `t('clave')`
8. **Stores por módulo** en `store/modules/` o en la carpeta del módulo
9. **Nada de `require()`** — solo `import`
10. **`border-border` explícito** en componentes que usan borde

---

## 9. Próximos Pasos (orden sugerido)

1. **Media upload** — subida de imágenes en formulario de catálogo
2. **Dashboard** — KPIs reales con datos de la API
3. **Pedidos** — listado y gestión de estados
4. **Inventario** — control de stock
5. **Campañas** — promociones y cupones
6. **Catálogo público** — vista previa / frontend store
