import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AdminService } from './admin.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { OwnerGuard } from '../../common/guards/owner.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, OwnerGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('clients')
  getClients() {
    return this.admin.findAllClients()
  }

  @Post('clients')
  createClient(
    @Body() body: {
      organizationName: string
      adminEmail: string
      adminName?: string
      adminPassword?: string
      modulesEnabled?: string[]
    },
  ) {
    return this.admin.createClient(body)
  }

  @Put('clients/:id/status')
  updateClientStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.admin.updateClientStatus(id, body.status)
  }

  @Put('clients/:id/modules')
  updateClientModules(
    @Param('id') id: string,
    @Body() body: { modulesEnabled: string[] },
  ) {
    return this.admin.updateClientModules(id, body.modulesEnabled)
  }
}
