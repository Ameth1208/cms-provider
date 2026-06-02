import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { RolesPermissionsService } from './roles-permissions.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { PermissionGuard } from '../../common/guards/permission.guard'
import { RequirePermission } from '../../common/decorators/permission.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Roles & Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller()
export class RolesPermissionsController {
  constructor(private service: RolesPermissionsService) {}

  @Get('permissions')
  findAllPermissions() {
    return this.service.findAllPermissions()
  }

  @Get('roles')
  @RequirePermission('roles', 'read')
  findAllRoles(@CurrentUser('organizationId') orgId: string) {
    return this.service.findAllRoles(orgId)
  }

  @Get('roles/:id')
  @RequirePermission('roles', 'read')
  findOneRole(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.service.findOneRole(id, orgId)
  }

  @Post('roles')
  @RequirePermission('roles', 'create')
  createRole(@Body() body: { name: string; description?: string; permissionIds: string[] }, @CurrentUser('organizationId') orgId: string) {
    return this.service.createRole(body, orgId)
  }

  @Put('roles/:id')
  @RequirePermission('roles', 'update')
  updateRole(@Param('id') id: string, @Body() body: { name?: string; description?: string; permissionIds?: string[] }, @CurrentUser('organizationId') orgId: string) {
    return this.service.updateRole(id, body, orgId)
  }

  @Delete('roles/:id')
  @RequirePermission('roles', 'delete')
  deleteRole(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.service.deleteRole(id, orgId)
  }
}
