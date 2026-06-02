export interface Organization {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  createdAt: string
}

export interface SystemSetting {
  id: string
  key: string
  value: string
  organizationId: string
}

export interface ThemeSettings {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  logoUrl: string | null
  companyName: string
}
