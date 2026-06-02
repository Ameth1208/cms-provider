import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { CampaignsService } from './campaigns.service'
import { HybridAuthGuard } from '../../common/guards/hybrid-auth.guard'
import { PermissionGuard } from '../../common/guards/permission.guard'
import { RequirePermission } from '../../common/decorators/permission.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Campaigns')
@ApiBearerAuth()
@UseGuards(HybridAuthGuard, PermissionGuard)
@Controller('campaigns')
export class CampaignsController {
  constructor(private campaigns: CampaignsService) {}

  @Get()
  @RequirePermission('campaigns', 'read')
  findAll(@CurrentUser('organizationId') orgId: string) {
    return this.campaigns.findAll(orgId)
  }

  @Get(':id')
  @RequirePermission('campaigns', 'read')
  findOne(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.campaigns.findOne(id, orgId)
  }

  @Post()
  @RequirePermission('campaigns', 'create')
  create(@Body() body: {
    name: string; description?: string; startDate: string; endDate: string
    autoApply: boolean
    discounts: { type: 'PERCENTAGE' | 'FIXED'; value: number; code?: string; maxUses?: number }[]
  }, @CurrentUser('organizationId') orgId: string) {
    return this.campaigns.create(body, orgId)
  }

  @Put(':id')
  @RequirePermission('campaigns', 'update')
  update(@Param('id') id: string, @Body() body: any, @CurrentUser('organizationId') orgId: string) {
    return this.campaigns.update(id, body, orgId)
  }

  @Post(':id/toggle')
  @RequirePermission('campaigns', 'update')
  toggleActive(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.campaigns.toggleActive(id, orgId)
  }

  @Delete(':id')
  @RequirePermission('campaigns', 'delete')
  delete(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.campaigns.delete(id, orgId)
  }

  @Post('auto-deactivate')
  @RequirePermission('campaigns', 'update')
  autoDeactivate() {
    return this.campaigns.autoDeactivateExpired()
  }
}
