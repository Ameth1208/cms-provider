import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'

@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest()
    
    if (!user?.roles) {
      throw new ForbiddenException('Access denied')
    }

    const isOwner = user.roles.includes('OWNER')
    
    if (!isOwner) {
      throw new ForbiddenException('Only system owners can access this resource')
    }

    return true
  }
}
