export type Resource = 'catalog' | 'orders' | 'inventory' | 'campaigns' | 'users' | 'roles' | 'settings' | 'media' | 'api_keys'
export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage'

export interface Permission {
  id: string
  resource: Resource
  action: Action
  name: string
}

export interface Role {
  id: string
  name: string
  description: string | null
  organizationId: string
  permissions: Permission[]
}

export interface CreateRole {
  name: string
  description?: string
  permissionIds: string[]
}

export interface UserWithRoles {
  id: string
  email: string
  name: string | null
  active: boolean
  roles: Role[]
}

export const RESOURCES: Resource[] = ['catalog', 'orders', 'inventory', 'campaigns', 'users', 'roles', 'settings', 'media', 'api_keys']
export const ACTIONS: Action[] = ['create', 'read', 'update', 'delete', 'manage']
