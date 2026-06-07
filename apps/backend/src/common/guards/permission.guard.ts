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

    return user.permissions.some((p: { resource: string; action: string }) => {
      // Full wildcard: *:* allows everything
      if (p.resource === '*' && p.action === '*') return true
      // Resource wildcard: catalog:* allows all catalog actions
      if (p.resource === required.resource && p.action === '*') return true
      // Action wildcard: *:read allows read on all resources
      if (p.resource === '*' && p.action === required.action) return true
      // Exact match
      if (p.resource === required.resource && p.action === required.action) return true
      // Admin/Manage permission on the resource
      if (p.resource === required.resource && p.action === 'manage') return true
      return false
    })
  }
}
