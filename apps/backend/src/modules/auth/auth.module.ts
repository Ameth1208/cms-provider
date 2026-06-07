import { Global, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'
import { HybridAuthGuard } from '../../common/guards/hybrid-auth.guard'
import { LoginUseCase } from './use-cases/login.use-case'
import { RegisterUseCase } from './use-cases/register.use-case'
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case'
import { GetProfileUseCase } from './use-cases/get-profile.use-case'
import { AcceptInvitationUseCase } from './use-cases/accept-invitation.use-case'
import { ValidateInvitationUseCase } from './use-cases/validate-invitation.use-case'

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'super-secret-jwt-key-change-in-production'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN', '24h'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Service (orchestrator)
    AuthService,
    // Use Cases
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,
    GetProfileUseCase,
    AcceptInvitationUseCase,
    ValidateInvitationUseCase,
    // Guards & Strategies
    JwtStrategy,
    HybridAuthGuard,
  ],
  exports: [AuthService, JwtModule, HybridAuthGuard],
})
export class AuthModule {}
