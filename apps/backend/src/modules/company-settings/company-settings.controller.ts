import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { CompanySettingsService } from './company-settings.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { PermissionGuard } from '../../common/guards/permission.guard'
import { RequirePermission } from '../../common/decorators/permission.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Company Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('settings')
export class CompanySettingsController {
  constructor(private settings: CompanySettingsService) {}

  @Get()
  @RequirePermission('settings', 'read')
  getSettings(@CurrentUser('organizationId') orgId: string) {
    return this.settings.getSettings(orgId)
  }

  @Put()
  @RequirePermission('settings', 'update')
  updateSettings(@Body() body: any, @CurrentUser('organizationId') orgId: string) {
    return this.settings.updateSettings(orgId, body)
  }
}
