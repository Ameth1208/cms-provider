import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@common/prisma.service'
import { JwtPayload } from '@cms/shared'

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async execute(token: string): Promise<{ accessToken: string }> {
    try {
      const decoded = this.jwt.verify(token, {
        secret: this.config.get('JWT_SECRET'),
      }) as JwtPayload

      const newPayload: JwtPayload = {
        sub: decoded.sub,
        email: decoded.email,
        organizationId: decoded.organizationId,
        permissions: decoded.permissions,
        roles: decoded.roles || [],
      }

      return { accessToken: this.jwt.sign(newPayload) }
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }
}
