import { Injectable, NotFoundException } from '@nestjs/common'
import { createHash, randomBytes } from 'crypto'
import { PrismaService } from '@common/prisma.service'

function generateApiKey(): string {
  return 'cmw_' + randomBytes(32).toString('hex')
}

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

@Injectable()
export class ApiKeysService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.apiKey.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        active: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(data: { name: string; permissions: string[] }, organizationId: string) {
    const rawKey = generateApiKey()
    const keyHash = hashKey(rawKey)
    const keyPrefix = rawKey.slice(0, 10)

    const record = await this.prisma.apiKey.create({
      data: {
        name: data.name,
        keyHash,
        keyPrefix,
        permissions: data.permissions,
        organizationId,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        active: true,
        createdAt: true,
      },
    })

    return { ...record, key: rawKey }
  }

  async regenerate(id: string, organizationId: string) {
    const existing = await this.prisma.apiKey.findFirst({
      where: { id, organizationId },
    })
    if (!existing) throw new NotFoundException('API key not found')

    const rawKey = generateApiKey()
    const keyHash = hashKey(rawKey)
    const keyPrefix = rawKey.slice(0, 10)

    const record = await this.prisma.apiKey.update({
      where: { id },
      data: { keyHash, keyPrefix, active: true, lastUsedAt: null },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return { ...record, key: rawKey }
  }

  async update(id: string, data: { name?: string; permissions?: string[]; active?: boolean }, organizationId: string) {
    const existing = await this.prisma.apiKey.findFirst({
      where: { id, organizationId },
    })
    if (!existing) throw new NotFoundException('API key not found')

    return this.prisma.apiKey.update({
      where: { id },
      data: {
        name: data.name,
        permissions: data.permissions,
        active: data.active,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        active: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  async remove(id: string, organizationId: string) {
    const existing = await this.prisma.apiKey.findFirst({
      where: { id, organizationId },
    })
    if (!existing) throw new NotFoundException('API key not found')

    await this.prisma.apiKey.delete({ where: { id } })
  }
}
