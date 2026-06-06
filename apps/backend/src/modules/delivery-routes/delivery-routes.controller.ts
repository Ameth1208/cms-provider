import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { DeliveryRoutesService } from './delivery-routes.service'
import { CreateRouteDto, UpdateRouteDto } from './dto/route.dto'
import { HybridAuthGuard } from '../../common/guards/hybrid-auth.guard'
import { PermissionGuard } from '../../common/guards/permission.guard'
import { RequirePermission } from '../../common/decorators/permission.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Delivery Routes')
@ApiBearerAuth()
@UseGuards(HybridAuthGuard, PermissionGuard)
@Controller('delivery-routes')
export class DeliveryRoutesController {
  constructor(private routes: DeliveryRoutesService) {}

  @Get()
  @RequirePermission('orders', 'read')
  findAll(
    @CurrentUser() user: any,
    @Query('date') date?: string,
    @Query('status') status?: string,
  ) {
    return this.routes.findAll(user.organizationId, { date, status })
  }

  @Get(':id')
  @RequirePermission('orders', 'read')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.routes.findOne(id, user.organizationId)
  }

  @Post()
  @RequirePermission('orders', 'create')
  create(@Body() dto: CreateRouteDto, @CurrentUser() user: any) {
    return this.routes.create(dto, user.organizationId)
  }

  @Put(':id')
  @RequirePermission('orders', 'update')
  update(@Param('id') id: string, @Body() dto: UpdateRouteDto, @CurrentUser() user: any) {
    return this.routes.update(id, dto, user.organizationId)
  }

  @Delete(':id')
  @RequirePermission('orders', 'delete')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.routes.remove(id, user.organizationId)
  }

  @Post(':id/start')
  @RequirePermission('orders', 'update')
  startRoute(@Param('id') id: string, @CurrentUser() user: any) {
    return this.routes.startRoute(id, user.organizationId)
  }

  @Post(':id/complete')
  @RequirePermission('orders', 'update')
  completeRoute(@Param('id') id: string, @CurrentUser() user: any) {
    return this.routes.completeRoute(id, user.organizationId)
  }
}
