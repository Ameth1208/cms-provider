# CMS Web Manager

Plataforma de gestión de negocios orientada a comercio electrónico. Cada cliente recibe su propia instancia desplegada de forma individual con módulos habilitables por negocio.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Monorepo | pnpm workspaces |
| Backend | NestJS + Prisma 7 + PostgreSQL |
| Frontend | Next.js 16 + React 18 + TypeScript |
| UI | shadcn/ui + TailwindCSS 3.4 + Iconify |
| Estado | Zustand (stores por módulo) |
| Autenticación | JWT (backend) |
| i18n | Custom hook con JSON por módulo (es/en) |

## Módulos

- **Auth** — Login, registro, JWT, invitaciones
- **Users** — Gestión de usuarios y roles
- **Catalog** — Productos, categorías, tags, variantes
- **Inventory** — Stock, lotes (FIFO), movimientos, alertas
- **Orders** — Pedidos, estados, asignación de drivers
- **Payments** — Pagos, reembolsos, estadísticas
- **Deliveries** — Envíos, tracking, rutas
- **Drivers** — Gestión de repartidores
- **Content** — Homepage, banners, carruseles, spotlights
- **Campaigns** — Promociones y cupones
- **Customers** — Clientes y direcciones
- **Returns** — Devoluciones
- **Reviews** — Reseñas
- **Media** — Upload de archivos
- **Admin** — Panel de administración de negocios

## Estructura del Proyecto

```
apps/
  backend/          # NestJS API
    src/modules/    # Módulos del backend
    prisma/         # Schema y seeds

  frontend/         # Next.js App
    src/app/        # Rutas y páginas
    src/components/ # Componentes UI
    src/i18n/       # Traducciones
    src/store/      # Zustand stores
    src/lib/        # Utilidades

packages/
  shared/           # Tipos compartidos
```

## Desarrollo

```bash
# Instalar dependencias
pnpm install

# Backend
pnpm --filter backend dev
pnpm --filter backend db:seed

# Frontend
pnpm --filter frontend dev
```

## Sistema de Roles

| Rol | Descripción |
|-----|-------------|
| **OWNER** | Control total. Gestiona módulos, negocios e invitaciones. |
| **ADMIN** | Panel de admin de clientes. Gestiona usuarios del negocio. |
| **MANAGER** | Acceso a módulos habilitados. No configura sistema. |
| **EDITOR** | Solo edita contenido en módulos asignados. |
| **VIEWER** | Solo lectura. Reportes y catálogos. |

## Arquitectura Backend

Cada módulo sigue el patrón de Clean Architecture con:
- **Controllers** — HTTP handlers
- **Services** — Coordinación de casos de uso
- **Use Cases** — Lógica de negocio individual
- **Guards** — Autorización basada en permisos

## Licencia

MIT
