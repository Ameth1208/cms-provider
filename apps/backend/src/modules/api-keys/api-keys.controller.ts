import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { ApiKeysService } from './api-keys.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { PermissionGuard } from '../../common/guards/permission.guard'
import { RequirePermission } from '../../common/decorators/permission.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('API Keys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('api-keys')
export class ApiKeysController {
  constructor(private apiKeys: ApiKeysService) {}

  @Get()
  @RequirePermission('api_keys', 'read')
  findAll(@CurrentUser('organizationId') orgId: string) {
    return this.apiKeys.findAll(orgId)
  }

  @Post()
  @RequirePermission('api_keys', 'create')
  create(@Body() body: { name: string; permissions: string[] }, @CurrentUser('organizationId') orgId: string) {
    return this.apiKeys.create(body, orgId)
  }

  @Put(':id')
  @RequirePermission('api_keys', 'update')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; permissions?: string[]; active?: boolean },
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.apiKeys.update(id, body, orgId)
  }

  @Post(':id/regenerate')
  @RequirePermission('api_keys', 'update')
  regenerate(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.apiKeys.regenerate(id, orgId)
  }

  @Delete(':id')
  @RequirePermission('api_keys', 'delete')
  remove(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.apiKeys.remove(id, orgId)
  }
}
