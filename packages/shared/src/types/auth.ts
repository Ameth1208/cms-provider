export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
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
