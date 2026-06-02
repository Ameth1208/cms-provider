import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PERMISSION_KEY } from '../decorators/permission.decorator'

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<{ resource: string; action: string }>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!required) return true

    const { user } = context.switchToHttp().getRequest()
    if (!user?.permissions) return false

    const hasPermission = user.permissions.some(
      (p: { resource: string; action: string }) =>
        p.resource === required.resource && p.action === required.action,
    )

    const isAdmin = user.permissions.some(
      (p: { resource: string; action: string }) =>
        p.resource === required.resource && p.action === 'manage',
    )

    return hasPermission || isAdmin
  }
}
