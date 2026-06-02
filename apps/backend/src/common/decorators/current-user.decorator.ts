import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export interface CurrentUserPayload {
  sub: string
  email: string
  organizationId: string
  permissions: { resource: string; action: string }[]
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user as CurrentUserPayload
    return data ? user?.[data] : user
  },
)
