import { SetMetadata } from '@nestjs/common'
import { Resource, Action } from '@cms/shared'

export const PERMISSION_KEY = 'permissions'
export const RequirePermission = (resource: Resource, action: Action) =>
  SetMetadata(PERMISSION_KEY, { resource, action })
