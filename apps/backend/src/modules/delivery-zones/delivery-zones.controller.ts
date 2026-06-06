import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { DeliveryZonesService } from './delivery-zones.service'
import { CreateZoneDto, UpdateZoneDto } from './dto/zone.dto'
import { HybridAuthGuard } from '../../common/guards/hybrid-auth.guard'
import { PermissionGuard } from '../../common/guards/permission.guard'
import { RequirePermission } from '../../common/decorators/permission.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Delivery Zones')
@ApiBearerAuth()
@UseGuards(HybridAuthGuard, PermissionGuard)
@Controller('delivery-zones')
export class DeliveryZonesController {
  constructor(private zones: DeliveryZonesService) {}

  @Get()
  @RequirePermission('orders', 'read')
  findAll(@CurrentUser() user: any) {
    return this.zones.findAll(user.organizationId)
  }

  @Get(':id')
  @RequirePermission('orders', 'read')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.zones.findOne(id, user.organizationId)
  }

  @Post()
  @RequirePermission('orders', 'create')
  create(@Body() dto: CreateZoneDto, @CurrentUser() user: any) {
    return this.zones.create(dto, user.organizationId)
  }

  @Put(':id')
  @RequirePermission('orders', 'update')
  update(@Param('id') id: string, @Body() dto: UpdateZoneDto, @CurrentUser() user: any) {
    return this.zones.update(id, dto, user.organizationId)
  }

  @Delete(':id')
  @RequirePermission('orders', 'delete')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.zones.remove(id, user.organizationId)
  }
}
