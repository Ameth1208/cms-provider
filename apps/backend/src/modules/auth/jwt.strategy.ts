import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { JwtPayload } from '@cms/shared'
import { PrismaService } from '@common/prisma.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET', 'super-secret-jwt-key-change-in-production'),
    })
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, active: true, organizationId: true },
    })

    if (!user || !user.active) {
      throw new UnauthorizedException()
    }

    return {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      permissions: payload.permissions,
      roles: payload.roles,
    }
  }
}
