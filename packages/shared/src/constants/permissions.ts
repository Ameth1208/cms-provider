import { Resource, Action } from '../types/permission'

export const DEFAULT_PERMISSIONS: { resource: Resource; action: Action; name: string }[] = [
  // Catalog
  { resource: 'catalog', action: 'create', name: 'Crear items de catálogo' },
  { resource: 'catalog', action: 'read', name: 'Ver items de catálogo' },
  { resource: 'catalog', action: 'update', name: 'Editar items de catálogo' },
  { resource: 'catalog', action: 'delete', name: 'Eliminar items de catálogo' },
  // Orders
  { resource: 'orders', action: 'create', name: 'Crear pedidos' },
  { resource: 'orders', action: 'read', name: 'Ver pedidos' },
  { resource: 'orders', action: 'update', name: 'Actualizar pedidos' },
  { resource: 'orders', action: 'delete', name: 'Eliminar pedidos' },
  // Inventory
  { resource: 'inventory', action: 'read', name: 'Ver inventario' },
  { resource: 'inventory', action: 'update', name: 'Ajustar inventario' },
  // Campaigns
  { resource: 'campaigns', action: 'create', name: 'Crear campañas' },
  { resource: 'campaigns', action: 'read', name: 'Ver campañas' },
  { resource: 'campaigns', action: 'update', name: 'Editar campañas' },
  { resource: 'campaigns', action: 'delete', name: 'Eliminar campañas' },
  // Users
  { resource: 'users', action: 'create', name: 'Crear usuarios' },
  { resource: 'users', action: 'read', name: 'Ver usuarios' },
  { resource: 'users', action: 'update', name: 'Editar usuarios' },
  { resource: 'users', action: 'delete', name: 'Eliminar usuarios' },
  // Roles
  { resource: 'roles', action: 'create', name: 'Crear roles' },
  { resource: 'roles', action: 'read', name: 'Ver roles' },
  { resource: 'roles', action: 'update', name: 'Editar roles' },
  { resource: 'roles', action: 'delete', name: 'Eliminar roles' },
  // Settings
  { resource: 'settings', action: 'read', name: 'Ver configuración' },
  { resource: 'settings', action: 'update', name: 'Editar configuración' },
  // Media
  { resource: 'media', action: 'create', name: 'Subir media' },
  { resource: 'media', action: 'delete', name: 'Eliminar media' },
  // API Keys
  { resource: 'api_keys', action: 'create', name: 'Crear API keys' },
  { resource: 'api_keys', action: 'read', name: 'Ver API keys' },
  { resource: 'api_keys', action: 'update', name: 'Editar API keys' },
  { resource: 'api_keys', action: 'delete', name: 'Eliminar API keys' },
]

export const ADMIN_ROLE_NAME = 'Administrador'
export const ADMIN_PERMISSIONS = DEFAULT_PERMISSIONS.map(p => `${p.resource}:${p.action}`)
