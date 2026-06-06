import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; password: string; organizationSlug?: string }) {
    return this.auth.login(body)
  }

  @Post('register')
  register(@Body() body: { email: string; password: string; name?: string; organizationName: string }) {
    return this.auth.register(body)
  }

  @Post('refresh')
  refresh(@Body() body: { refreshToken: string }) {
    return this.auth.refresh(body.refreshToken)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getProfile(@CurrentUser('sub') userId: string) {
    return this.auth.getProfile(userId)
  }

  @Post('accept-invitation')
  acceptInvitation(
    @Body() body: { token: string; name: string; password: string },
  ) {
    return this.auth.acceptInvitation(body.token, {
      name: body.name,
      password: body.password,
    })
  }

  @Get('validate-invitation')
  validateInvitation(@Query('token') token: string) {
    return this.auth.validateInvitationToken(token)
  }
}
