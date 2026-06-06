import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { DriversService } from './drivers.service'
import { CreateDriverDto } from './dto/create-driver.dto'
import { UpdateDriverDto } from './dto/update-driver.dto'
import { HybridAuthGuard } from '../../common/guards/hybrid-auth.guard'
import { PermissionGuard } from '../../common/guards/permission.guard'
import { RequirePermission } from '../../common/decorators/permission.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Drivers')
@ApiBearerAuth()
@UseGuards(HybridAuthGuard, PermissionGuard)
@Controller('drivers')
export class DriversController {
  constructor(private drivers: DriversService) {}

  @Get()
  @RequirePermission('drivers', 'read')
  findAll(@CurrentUser() user: any, @Query('active') active?: string) {
    return this.drivers.findAll(user.organizationId, active === 'true' ? true : active === 'false' ? false : undefined)
  }

  @Get('stats')
  @RequirePermission('drivers', 'read')
  getStats(@CurrentUser() user: any) {
    return this.drivers.getStats(user.organizationId)
  }

  @Get(':id')
  @RequirePermission('drivers', 'read')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.drivers.findOne(id, user.organizationId)
  }

  @Get(':id/orders')
  @RequirePermission('drivers', 'read')
  getDriverOrders(@Param('id') id: string, @CurrentUser() user: any) {
    return this.drivers.getDriverOrders(id, user.organizationId)
  }

  @Post()
  @RequirePermission('drivers', 'create')
  create(@Body() dto: CreateDriverDto, @CurrentUser() user: any) {
    return this.drivers.create(dto, user.organizationId)
  }

  @Put(':id')
  @RequirePermission('drivers', 'update')
  update(@Param('id') id: string, @Body() dto: UpdateDriverDto, @CurrentUser() user: any) {
    return this.drivers.update(id, dto, user.organizationId)
  }

  @Delete(':id')
  @RequirePermission('drivers', 'delete')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.drivers.remove(id, user.organizationId)
  }

  @Post(':id/location')
  @RequirePermission('drivers', 'update')
  updateLocation(
    @Param('id') id: string,
    @Body() body: { lat: number; lng: number },
    @CurrentUser() user: any,
  ) {
    return this.drivers.updateLocation(id, body.lat, body.lng, user.organizationId)
  }
}
