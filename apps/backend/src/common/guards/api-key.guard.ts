import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { createHash } from 'crypto'
import { PrismaService } from '../prisma.service'

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const apiKey = request.headers['api-key'] as string | undefined

    if (!apiKey) {
      return true // Let JWT guard handle it if no API key present
    }

    const keyHash = createHash('sha256').update(apiKey).digest('hex')

    const keyRecord = await this.prisma.apiKey.findUnique({
      where: { keyHash },
      include: { organization: true },
    })

    if (!keyRecord || !keyRecord.active) {
      throw new UnauthorizedException('Invalid API key')
    }

    // Update last used
    await this.prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() },
    })

    // Attach user-like object to request so PermissionGuard works
    request.user = {
      sub: `apikey:${keyRecord.id}`,
      email: `apikey@${keyRecord.organization.slug}`,
      organizationId: keyRecord.organizationId,
      permissions: keyRecord.permissions.map((p) => {
        const [resource, action] = p.split(':')
        return { resource, action }
      }),
    }

    return true
  }
}
