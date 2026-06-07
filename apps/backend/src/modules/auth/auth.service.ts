import { Injectable } from '@nestjs/common'
import { LoginUseCase } from './use-cases/login.use-case'
import { RegisterUseCase } from './use-cases/register.use-case'
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case'
import { GetProfileUseCase } from './use-cases/get-profile.use-case'
import { AcceptInvitationUseCase } from './use-cases/accept-invitation.use-case'
import { ValidateInvitationUseCase } from './use-cases/validate-invitation.use-case'
import { LoginRequest } from '@cms/shared'

@Injectable()
export class AuthService {
  constructor(
    private loginUseCase: LoginUseCase,
    private registerUseCase: RegisterUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private getProfileUseCase: GetProfileUseCase,
    private acceptInvitationUseCase: AcceptInvitationUseCase,
    private validateInvitationUseCase: ValidateInvitationUseCase,
  ) {}

  login(data: LoginRequest) {
    return this.loginUseCase.execute(data)
  }

  register(data: { email: string; password: string; name?: string; organizationName: string }) {
    return this.registerUseCase.execute(data)
  }

  refresh(token: string) {
    return this.refreshTokenUseCase.execute(token)
  }

  getProfile(userId: string) {
    return this.getProfileUseCase.execute(userId)
  }

  acceptInvitation(token: string, data: { name: string; password: string }) {
    return this.acceptInvitationUseCase.execute(token, data)
  }

  validateInvitationToken(token: string) {
    return this.validateInvitationUseCase.execute(token)
  }
}
