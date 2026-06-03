# CMS Web Manager — Roadmap

> Documento vivo. Registra decisiones de arquitectura, plan de funcionalidades y evolución del producto.

---

## 1. Visión del Producto

CMS Web Manager es una plataforma de gestión de negocios orientada a comercio electrónico. Cada cliente recibe su propia instancia desplegada de forma individual. A largo plazo, la plataforma podrá operar en modo multi-tenant donde un solo despliegue sirva a múltiples clientes.

**Principios:**
- Modularidad: cada funcionalidad es un módulo que puede habilitarse/deshabilitarse.
- Progresividad: los módulos se liberan de a poco, no todos de golpe.
- Control: el owner decide qué ven y qué pueden hacer sus usuarios.

---

## 2. Sistema de Usuarios y Roles

### 2.1 Roles

| Rol | Descripción |
|-----|-------------|
| **OWNER** | Primer usuario creado. Control total. Puede gestionar módulos, negocios, invitaciones y usuarios. |
| **ADMIN** | Usuario con acceso al panel de administración de clientes. Puede invitar y gestionar usuarios dentro de un negocio. |
| **MANAGER** | Gestor de un negocio. Acceso a la mayoría de módulos habilitados, pero no a configuración de sistema. |
| **EDITOR** | Usuario operativo. Solo puede editar contenido en módulos asignados (catálogo, campañas, etc). |
| **VIEWER** | Solo lectura. Puede ver reportes y catálogos pero no modificarlos. |

### 2.2 Permisos por Módulo

Cada módulo define permisos granulares:

- `module.{name}.read` — ver el módulo
- `module.{name}.write` — crear/editar dentro del módulo
- `module.{name}.delete` — eliminar recursos del módulo
- `module.{name}.admin` — configurar el módulo (ej: ajustes de catálogo)

Ejemplos:
- `module.catalog.read`, `module.catalog.write`, `module.catalog.delete`, `module.catalog.admin`
- `module.campaigns.read`, `module.campaigns.write`
- `module.users.admin` (solo OWNER/ADMIN pueden gestionar usuarios)

### 2.3 Primer Usuario = Owner

Durante el setup inicial (o primer registro), el sistema crea automáticamente el usuario OWNER. Este usuario:
- No puede ser eliminado.
- Tiene acceso a todos los módulos.
- Ve el link "Admin" en el navbar.
- Puede gestionar la suscripción/plan del negocio.

---

## 3. Negocios (Business)

### 3.1 Modelo

Un `Business` representa una entidad comercial. Inicialmente cada instancia desplegada tiene un solo Business. A futuro, un solo despliegue puede tener múltiples Business.

**Campos clave:**
- `id`, `name`, `slug`, `logo`, `plan`, `status`
- `modulesEnabled`: lista de módulos activos para este negocio
- `settings`: configuración general (moneda, zona horaria, idioma por defecto)
- `ownerId`: referencia al usuario OWNER

### 3.2 Módulos Habilitados por Negocio

El owner define qué módulos están disponibles para su negocio. Esto permite:
- Liberar funcionalidades de a poco.
- Cobrar por módulos adicionales en el futuro.
- Mantener la UI limpia mostrando solo lo que el cliente usa.

Módulos actuales planeados:
- `catalog` — Catálogo de productos
- `inventory` — Inventario y stock
- `orders` — Pedidos
- `campaigns` — Campañas de marketing
- `users` — Gestión de usuarios del equipo
- `apiKeys` — API keys para integraciones
- `reviews` — Reseñas de clientes
- `analytics` — Analíticas y reportes (futuro)
- `settings` — Configuración del negocio

### 3.3 Multi-tenancy (Futuro)

Fase 1 (ahora): una instancia = un negocio.
Fase 2 (futuro): una instancia = múltiples negocios. Cada usuario pertenece a un `businessId`. Los datos se filtran por este ID.

---

## 4. Panel de Administración

### 4.1 Link "Admin" en Navbar

Visible solo para OWNER y ADMIN. Al hacer click despliega o navega a:

```
/admin
├── /clients          — Lista de clientes (negocios) [OWNER only]
├── /clients/[id]     — Detalle de un cliente
├── /invitations      — Links de invitación activos
├── /modules          — Configuración global de módulos
├── /billing          — Facturación y suscripciones
└── /audit            — Logs de actividad
```

### 4.2 Gestión de Clientes

El owner puede:
- Ver todos los negocios registrados.
- Crear un nuevo negocio (provisión).
- Suspender/reactivar un negocio.
- Ver uso de módulos por negocio.

### 4.3 Links de Invitación

Sistema de invitación por link:
- El owner/admin genera un link de invitación con:
  - Rol predefinido (MANAGER, EDITOR, VIEWER)
  - Módulos permitidos
  - Expiración (opcional)
  - Límite de usos (opcional)
- El destinatario accede al link, crea su cuenta (o inicia sesión), y se une automáticamente al negocio.

---

## 5. Flujo de Liberación de Módulos

1. El owner accede a `/admin/modules`.
2. Ve todos los módulos disponibles.
3. Activa/desactiva módulos para su negocio.
4. Los módulos desactivados:
   - No aparecen en el sidebar.
   - Sus rutas devuelven 403 o redirigen.
   - Sus APIs devuelven 403.

Esto permite que el owner decida cuándo cada cliente está listo para usar una funcionalidad, incluso si el contrato no ha finalizado.

---

## 6. Despliegue por Cliente

Cada cliente recibe:
- Su propia base de datos (schema aislado o DB separada).
- Su propio dominio/subdominio.
- Su propia configuración de módulos.
- El owner puede gestionar todos desde un panel central (futuro).

---

## 7. Próximos Pasos Inmediatos

1. **Ajuste de paleta de colores** — Unificar modo oscuro a una paleta coherente (negro + gris neutro + acento único).
2. **Schema Prisma: Business + Role + Permission** — Extender el modelo de datos.
3. **Backend: módulo Auth con roles y permisos** — Guards y decoradores.
4. **Frontend: gestión de usuarios** — CRUD de usuarios del equipo con asignación de roles.
5. **Frontend: panel Admin** — Link en navbar, páginas de admin.
6. **Sistema de invitaciones** — Generar links, aceptar invitaciones.
7. **Módulos habilitados por negocio** — Filtrar sidebar y rutas según configuración.

---

## 8. Decisiones Técnicas

- **UUID v4** para todos los IDs (ya implementado).
- **localStorage JWT** para auth (ya implementado).
- **Zustand** para state local por módulo (ya implementado).
- **i18n custom hook** con namespaces (ya implementado).
- **Kebab-case** para archivos (ya implementado).
