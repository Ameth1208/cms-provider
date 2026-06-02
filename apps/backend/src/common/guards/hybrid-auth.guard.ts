import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { createHash } from 'crypto'
import { PrismaService } from '../prisma.service'

@Injectable()
export class HybridAuthGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization as string | undefined
    const apiKey = request.headers['x-api-key'] as string | undefined

    // Try JWT first
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      try {
        const payload = this.jwt.verify(token, {
          secret: this.config.get('JWT_SECRET'),
        }) as any

        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
          select: { id: true, email: true, active: true, organizationId: true },
        })

        if (!user || !user.active) {
          throw new UnauthorizedException('Invalid token')
        }

        request.user = {
          sub: user.id,
          email: user.email,
          organizationId: user.organizationId,
          permissions: payload.permissions || [],
        }

        return true
      } catch {
        throw new UnauthorizedException('Invalid token')
      }
    }

    // Fallback to API key
    if (apiKey) {
      const keyHash = createHash('sha256').update(apiKey).digest('hex')

      const keyRecord = await this.prisma.apiKey.findUnique({
        where: { keyHash },
        include: { organization: true },
      })

      if (!keyRecord || !keyRecord.active) {
        throw new UnauthorizedException('Invalid API key')
      }

      await this.prisma.apiKey.update({
        where: { id: keyRecord.id },
        data: { lastUsedAt: new Date() },
      })

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

    throw new UnauthorizedException('Authentication required')
  }
}
