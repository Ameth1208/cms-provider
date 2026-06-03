import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'
import { ThemeSettings } from '@cms/shared'

@Injectable()
export class CompanySettingsService {
  constructor(private prisma: PrismaService) {}

  private readonly defaultSettings: Record<string, string> = {
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    accentColor: '#f59e0b',
    fontFamily: 'Inter, sans-serif',
    logoUrl: '',
    companyName: 'My Company',
  }

  async getSettings(organizationId: string): Promise<ThemeSettings> {
    const settings = await this.prisma.systemSetting.findMany({
      where: { organizationId },
    })

    const map: Record<string, string> = {}
    for (const s of settings) {
      map[s.key] = s.value
    }

    return {
      primaryColor: map.primaryColor || this.defaultSettings.primaryColor,
      secondaryColor: map.secondaryColor || this.defaultSettings.secondaryColor,
      accentColor: map.accentColor || this.defaultSettings.accentColor,
      fontFamily: map.fontFamily || this.defaultSettings.fontFamily,
      logoUrl: map.logoUrl || null,
      companyName: map.companyName || this.defaultSettings.companyName,
    }
  }

  async updateSettings(organizationId: string, data: Partial<ThemeSettings>) {
    const entries = Object.entries(data).filter(([_, v]) => v !== undefined)

    for (const [key, value] of entries) {
      await this.prisma.systemSetting.upsert({
        where: {
          organizationId_key: { organizationId, key },
        },
        create: { organizationId, key, value: String(value) },
        update: { value: String(value) },
      })
    }

    return this.getSettings(organizationId)
  }

  async getModules(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { modulesEnabled: true },
    })
    return { modules: org?.modulesEnabled ?? [] }
  }

  async updateModules(organizationId: string, modules: string[]) {
    const validModules = [
      'catalog', 'inventory', 'orders', 'campaigns',
      'content', 'users', 'apiKeys', 'reviews', 'settings',
    ]
    const filtered = modules.filter((m) => validModules.includes(m))

    await this.prisma.organization.update({
      where: { id: organizationId },
      data: { modulesEnabled: filtered },
    })

    return { modules: filtered }
  }
}
