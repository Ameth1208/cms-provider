export interface LoginRequest {
  email: string
  password: string
  organizationSlug?: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export interface MultiOrgLoginResponse {
  requireOrganizationSelection: true
  organizations: {
    id: string
    name: string
    slug: string
  }[]
}

export interface AuthUser {
  id: string
  email: string
  name: string | null
  organizationId: string
  organizationName: string
  permissions: { resource: string; action: string }[]
  roles: string[]
  modulesEnabled: string[]
}

export interface JwtPayload {
  sub: string
  email: string
  organizationId: string
  permissions: { resource: string; action: string }[]
  roles: string[]
}
