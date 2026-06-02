import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { PermissionGuard } from '../../common/guards/permission.guard'
import { RequirePermission } from '../../common/decorators/permission.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  @RequirePermission('users', 'read')
  findAll(@CurrentUser('organizationId') orgId: string) {
    return this.users.findAll(orgId)
  }

  @Get(':id')
  @RequirePermission('users', 'read')
  findOne(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.users.findOne(id, orgId)
  }

  @Post()
  @RequirePermission('users', 'create')
  create(@Body() body: { email: string; password: string; name?: string; roleIds: string[] }, @CurrentUser('organizationId') orgId: string) {
    return this.users.create(body, orgId)
  }

  @Put(':id')
  @RequirePermission('users', 'update')
  update(@Param('id') id: string, @Body() body: { name?: string; active?: boolean; roleIds?: string[] }, @CurrentUser('organizationId') orgId: string) {
    return this.users.update(id, body, orgId)
  }

  @Delete(':id')
  @RequirePermission('users', 'delete')
  remove(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.users.remove(id, orgId)
  }
}
